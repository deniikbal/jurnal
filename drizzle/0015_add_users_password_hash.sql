ALTER TABLE "users" ADD COLUMN "password_hash" text;--> statement-breakpoint
-- User Google existing: set placeholder hash. Mereka harus minta admin reset.
-- Placeholder ini tidak bisa di-verify sebagai password valid.
UPDATE "users" SET "password_hash" = 'GOOGLE_MIGRATED_PLEASE_CONTACT_ADMIN' WHERE "id" IN (SELECT DISTINCT "user_id" FROM "accounts");--> statement-breakpoint
-- Hapus semua account Google (sudah tidak dipakai)
TRUNCATE "accounts" RESTART IDENTITY CASCADE;
