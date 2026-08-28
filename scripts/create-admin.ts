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
// @better-auth/utils password.node.mjs). Jika berbeda, hash yang disimpan
// akan dianggap invalid oleh Better Auth saat sign-in → 500.
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
 * Create the first admin user.
 *
 * Usage:
 *   node --env-file=.env node_modules/tsx/dist/cli.mjs scripts/create-admin.ts <email> <password> <name>
 *
 * Example:
 *   node --env-file=.env node_modules/tsx/dist/cli.mjs scripts/create-admin.ts admin@sekolah.sch.id password123 "Admin Utama"
 */

async function main() {
  const [email, password, name] = process.argv.slice(2)

  if (!email || !password || !name) {
    console.error(
      "Usage: node --env-file=.env node_modules/tsx/dist/cli.mjs scripts/create-admin.ts <email> <password> <name>",
    )
    process.exit(1)
  }

  // Cek apakah user sudah ada
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)

  if (existing) {
    console.error(`Email ${email} sudah terdaftar.`)
    process.exit(1)
  }

  // Buat user baru
  const [newUser] = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      name,
      role: "admin",
    })
    .returning()

  // Hash password dengan scrypt (kompatibel Better Auth)
  const passwordHash = await hashPassword(password)

  // Buat account record (credential provider).
  // Penting:
  //   - `issuer` WAJIB "local:credential" agar Better Auth bisa menemukan
  //     akun ini saat sign-in/email-password.
  //   - `password` harus di-hash dengan format yang sama persis dengan
  //     hashPassword() di Better Auth (scrypt: saltHex:keyHex).
  await db.insert(account).values({
    userId: newUser.id,
    accountId: newUser.id,
    providerId: "credential",
    issuer: "local:credential",
    password: passwordHash,
  })

  console.log("Admin berhasil dibuat!")
  console.log("  ID:   ", newUser.id)
  console.log("  Email:", newUser.email)
  console.log("  Name: ", newUser.name)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
