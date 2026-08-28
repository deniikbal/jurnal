# Setup & Migrasi Auth — NextAuth → better-auth

## Prasyarat

- Node.js 18+
- pnpm
- Akses ke Neon PostgreSQL (atau database lainnya)

---

## Langkah 1: Update Environment Variables

Buka `.env` dan ganti isi berikut:

```env
# Hapus baris ini:
# AUTH_SECRET=""
# AUTH_URL=""

# Ganti dengan:
BETTER_AUTH_SECRET="<bikin random 32 karakter, contoh: openssl rand -base64 32>"
BETTER_AUTH_URL="http://localhost:3000"

# Database tetap sama:
DATABASE_URL="postgresql://..."
```

Generate secret:
```bash
openssl rand -base64 32
```

---

## Langkah 2: Install Dependencies

```bash
pnpm install
```

> `tsx` sudah termasuk di devDependencies untuk menjalankan script.

---

## Langkah 3: Jalankan SQL Migration di Database

Buka **Neon Dashboard** → SQL Editor, jalankan perintah berikut:

```sql
-- 1. Tambah kolom yang dibutuhkan better-auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW() NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW() NOT NULL;

-- 2. (Opsional) Hapus tabel auth lama yang tidak dipakai lagi
DROP TABLE IF EXISTS authenticators CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

-- 3. Buat tabel better-auth (session, account, verification)
CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "issuer" text,
  "account_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "access_token" text,
  "refresh_token" text,
  "access_token_expires_at" timestamp,
  "refresh_token_expires_at" timestamp,
  "scope" text,
  "id_token" text,
  "password" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token" text NOT NULL UNIQUE,
  "expires_at" timestamp NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

> **Catatan:**
> - Kolom `password_hash` sudah tidak ada di database (sudah di-drop di migration sebelumnya), jadi tidak perlu di-NULL-kan.
> - Tabel `session`, `account`, `verification` dibuat manual di atas karena better-auth tidak otomatis membuat tabel saat pertama kali ada request.

---

## Langkah 4: Buat Admin Pertama

```bash
node --env-file=.env node_modules/tsx/dist/cli.mjs scripts/create-admin.ts admin@sekolah.sch.id password123 "Admin Utama"
```

Ganti `admin@sekolah.sch.id`, `password123`, dan `"Admin Utama"` sesuai kebutuhan.

---

## Langkah 5: Set Password untuk User yang Sudah Ada

Untuk setiap user yang sudah ada di database tapi belum punya password:

```bash
node --env-file=.env node_modules/tsx/dist/cli.mjs scripts/set-password.ts deniikbal31@guru.sma.belajar.id password_baru_anda
```

Ulangi untuk setiap user yang perlu login.

---

## Langkah 6: Jalankan Aplikasi

```bash
pnpm run dev
```

Buka http://localhost:3000/login dan login dengan email + password yang baru dibuat.

---

## Ringkasan Perubahan

| File | Aksi |
|---|---|
| `auth.ts` | Ditulis ulang — NextAuth → better-auth |
| `lib/db/schema.ts` | Diperbarui — hapus tabel auth lama, tambah tabel better-auth |
| `app/api/auth/[...all]/route.ts` | **Baru** — handler better-auth |
| `lib/auth-client.ts` | **Baru** — client instance |
| `lib/dal.ts` | Diperbarui — pakai better-auth session |
| `app/login/page.tsx` | Diperbarui — client-side signIn |
| `components/logout-button.tsx` | Diperbarui — client signOut |
| `app/page.tsx` | Diperbarui — update import + text |
| `.env.example` | Diperbarui — vars baru |
| `scripts/create-admin.ts` | **Baru** — bikin admin |
| `scripts/set-password.ts` | **Baru** — set password user existing |
| `package.json` | Dihapus `next-auth`, `@auth/drizzle-adapter` |

### File yang Dihapus

- `lib/password.ts`
- `lib/auth-actions.ts`
- `next-auth.d.ts`
- `app/api/auth/[...nextauth]/route.ts`
