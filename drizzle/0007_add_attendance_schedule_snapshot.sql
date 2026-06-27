ALTER TABLE "attendance" ADD COLUMN IF NOT EXISTS "subject_id" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN IF NOT EXISTS "subject_name" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN IF NOT EXISTS "subject_kode" text;
--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN IF NOT EXISTS "classroom_id" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN IF NOT EXISTS "classroom_name" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN IF NOT EXISTS "day" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN IF NOT EXISTS "jam_ke" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN IF NOT EXISTS "start_time" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN IF NOT EXISTS "end_time" text DEFAULT '' NOT NULL;
