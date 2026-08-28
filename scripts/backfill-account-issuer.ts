import { db } from "../lib/db"
import { account, users } from "../lib/db/schema"
import { and, eq, isNull } from "drizzle-orm"

/**
 * Backfill kolom `account.issuer` = "local:credential" untuk akun
 * credential yang dibuat sebelum perbaikan (issuer NULL).
 *
 * Tanpa issuer ini, Better Auth sign-in menolak akun dengan
 * "User not found" (401) walaupun email + password benar.
 *
 * Usage:
 *   node --env-file=.env node_modules/tsx/dist/cli.mjs scripts/backfill-account-issuer.ts
 */

const LOCAL_ISSUER = "local:credential"

async function main() {
  const candidates = await db
    .select({
      id: account.id,
      userId: account.userId,
      providerId: account.providerId,
      issuer: account.issuer,
      email: users.email,
    })
    .from(account)
    .innerJoin(users, eq(users.id, account.userId))
    .where(
      and(eq(account.providerId, "credential"), isNull(account.issuer)),
    )

  if (candidates.length === 0) {
    console.log("Tidak ada akun yang perlu di-backfill. Semua sudah OK.")
    return
  }

  console.log(`Menemukan ${candidates.length} akun tanpa issuer. Memperbaiki...`)

  for (const row of candidates) {
    await db
      .update(account)
      .set({ issuer: LOCAL_ISSUER })
      .where(eq(account.id, row.id))
    console.log(`  - ${row.email}`)
  }

  console.log("Selesai. Coba login lagi dengan akun tersebut.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
