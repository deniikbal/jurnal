import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "@/lib/db/schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum diisi")
}

// ponytail: 15s fetch timeout + 2x retry untuk ECONNRESET. Neon pooler kadang
// kill koneksi mid-flight (cold start / autoscale). Default node fetch tidak
// ada timeout = request hang 30+ detik. Wrap neon client sebagai fungsi.
neonConfig.fetchConnectionCache = true

const baseClient = neon(process.env.DATABASE_URL)

const TIMEOUT_MS = 15_000
const MAX_RETRIES = 2

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  return new Promise<T>((resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`Neon query timeout ${ms}ms`)), ms)
    promise.then(
      (v) => {
        if (timer) clearTimeout(timer)
        resolve(v)
      },
      (e) => {
        if (timer) clearTimeout(timer)
        reject(e)
      },
    )
  })
}

function isRetryable(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const msg = err.message.toLowerCase()
  // Cek error cause (ECONNRESET sering di-wrap sebagai cause, bukan message).
  const causeMsg = err.cause instanceof Error ? err.cause.message.toLowerCase() : ""
  const haystack = `${msg} ${causeMsg}`
  return (
    haystack.includes("econnreset") ||
    haystack.includes("terminated") ||
    haystack.includes("fetch failed") ||
    haystack.includes("socket hang up") ||
    haystack.includes("connection_failure") ||
    haystack.includes("connection reset") ||
    haystack.includes("neon query timeout")
  )
}

async function runWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await withTimeout(fn(), TIMEOUT_MS)
    } catch (err) {
      lastErr = err
      const msg = err instanceof Error ? err.message : String(err)
      // ponytail: log agar root cause kelihatan di Next.js console.
      console.warn(`[db] attempt ${attempt + 1} failed: ${msg.slice(0, 200)}`)
      if (!isRetryable(err) || attempt === MAX_RETRIES) {
        // Preserve error chain (Drizzle wraps as DrizzleQueryError with .cause).
        throw err
      }
      await new Promise((r) => setTimeout(r, 200 * 2 ** attempt))
    }
  }
  throw lastErr
}

// neon() returns a callable. Drizzle panggil sebagai fungsi langsung (untuk
// query SQL) atau via .transaction(). Keduanya kita route lewat retry.
const neonClient: typeof baseClient = ((
  ...args: Parameters<typeof baseClient>
) => runWithRetry(() => baseClient(...args))) as typeof baseClient

// Preserve methods like .transaction on the wrapped callable.
;(neonClient as unknown as { transaction: typeof baseClient.transaction }).transaction = ((
  ...args: Parameters<typeof baseClient.transaction>
) => runWithRetry(() => baseClient.transaction(...args))) as typeof baseClient.transaction

export const db = drizzle(neonClient, { schema })
