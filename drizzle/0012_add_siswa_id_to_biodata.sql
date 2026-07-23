ALTER TABLE "biodata_siswa" ADD COLUMN "siswa_id" text;--> statement-breakpoint
ALTER TABLE "biodata_siswa" ADD CONSTRAINT "biodata_siswa_siswa_id_siswa_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."siswa"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
