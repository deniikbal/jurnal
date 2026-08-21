import { neon, type NeonQueryFunction } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "@/lib/db/schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum diisi")
}

const MAX_ATTEMPTS = 3
const BASE_DELAY_MS = 500

function isTransientError(error: unknown): boolean {
  const cause = error instanceof Error ? error.cause : undefined
  if (cause instanceof Error && cause.name === "NeonDbError") return false

  const status =
    (error as { status?: number; statusCode?: number }).status ??
    (error as { status?: number; statusCode?: number }).statusCode
  if (typeof status === "number" && status >= 400 && status < 500) return false

  const message =
    (error instanceof Error ? error.message : String(error)) +
    (cause instanceof Error ? ` ${cause.message}` : "")

  return /fetch failed|network|ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket|abort|timeout|temporarily unavailable|502|503|500/i.test(
    message,
  )
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let attempt = 0
  for (;;) {
    try {
      return await fn()
    } catch (error) {
      attempt += 1
      if (attempt >= MAX_ATTEMPTS || !isTransientError(error)) throw error
      await new Promise((resolve) => setTimeout(resolve, BASE_DELAY_MS * attempt))
    }
  }
}

const neonClient = neon(process.env.DATABASE_URL)

const retryingClient = Object.assign(
  ((strings: TemplateStringsArray, ...values: unknown[]) =>
    withRetry(() => neonClient(strings, ...values))) as NeonQueryFunction<any, any>,
  {
    query: (sql: string, params?: unknown[], opts?: Record<string, unknown>) =>
      withRetry(() => neonClient.query(sql, params, opts)),
    unsafe: (rawSQL: string) => neonClient.unsafe(rawSQL),
    transaction: (queries: any, opts?: Record<string, unknown>) =>
      withRetry(() => neonClient.transaction(queries, opts)),
  },
)

export const db = drizzle(retryingClient, { schema })