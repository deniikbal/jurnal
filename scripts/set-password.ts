import { randomBytes, scrypt as scryptCb } from "node:crypto"
import { promisify } from "node:util"

import { db } from "../lib/db"
import { account, users } from "../lib/db/schema"
import { eq } from "drizzle-orm"

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>

// Parameter HARUS sama dengan yang dipakai Better Auth (lihat
// @better-auth/utils password.node.mjs).
const SCRYPT_CONFIG = { N: 16384, r: 16, p: 1, dkLen: 64 }

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex")
  const key = await scrypt(password.normalize("NFKC"), salt, SCRYPT_CONFIG.dkLen, {
    N: SCRYPT_CONFIG.N,
    r: SCRYPT_CONFIG.r,
    p: SCRYPT_CONFIG.p,
    maxmem: 128 * SCRYPT_CONFIG.N * SCRYPT_CONFIG.r * 2,
  })
  return `${salt}:${key.toString("hex")}`
}

/**
 * Set password for an existing user by creating an "account" record.
 *
 * Usage:
 *   node --env-file=.env node_modules/tsx/dist/cli.mjs scripts/set-password.ts <email> <password>
 *
 * Example:
 *   node --env-file=.env node_modules/tsx/dist/cli.mjs scripts/set-password.ts deniikbal31@guru.sma.belajar.id mypassword123
 */

async function main() {
  const [email, password] = process.argv.slice(2)

  if (!email || !password) {
    console.error(
      "Usage: node --env-file=.env node_modules/tsx/dist/cli.mjs scripts/set-password.ts <email> <password>",
    )
    process.exit(1)
  }

  // Cari user existing
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)

  if (!existingUser) {
    console.error(`User dengan email ${email} tidak ditemukan di database.`)
    console.error("Buat user dulu lewat script create-admin.")
    process.exit(1)
  }

  // Hash password dengan scrypt (kompatibel Better Auth)
  const passwordHash = await hashPassword(password)

  // Hapus account lama jika ada
  await db.delete(account).where(eq(account.userId, existingUser.id))

  // Insert account record baru (credential provider).
  // Penting:
  //   - `issuer` WAJIB "local:credential" — jika kosong, Better Auth
  //     sign-in gagal dengan "User not found" (401).
  //   - `password` harus di-hash dengan format yang sama persis dengan
  //     hashPassword() di Better Auth (scrypt: saltHex:keyHex).
  await db.insert(account).values({
    userId: existingUser.id,
    accountId: existingUser.id,
    providerId: "credential",
    issuer: "local:credential",
    password: passwordHash,
  })

  console.log("Password berhasil diatur!")
  console.log("  Email:", email)
  console.log("  Silakan login dengan password baru Anda.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
