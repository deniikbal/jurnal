ALTER TABLE "siswa" DROP CONSTRAINT IF EXISTS "siswa_kelas_id_kelas_id_fk";
--> statement-breakpoint
ALTER TABLE "siswa" RENAME COLUMN "nama" TO "name";
--> statement-breakpoint
ALTER TABLE "siswa" RENAME COLUMN "kelas_id" TO "classroom_id";
--> statement-breakpoint
ALTER TABLE "siswa" ADD COLUMN IF NOT EXISTS "jenis_kelamin" text DEFAULT 'laki-laki' NOT NULL;
--> statement-breakpoint
ALTER TABLE "siswa" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'aktif' NOT NULL;
--> statement-breakpoint
ALTER TABLE "siswa" ADD CONSTRAINT "siswa_classroom_id_classroom_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classroom"("id") ON DELETE cascade ON UPDATE no action NOT VALID;
