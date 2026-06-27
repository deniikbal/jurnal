CREATE TABLE "journal" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"schedule_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"subject_name" text NOT NULL,
	"subject_kode" text,
	"classroom_id" text NOT NULL,
	"classroom_name" text NOT NULL,
	"day" text NOT NULL,
	"jam_ke" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"materi" text NOT NULL,
	"kegiatan" text NOT NULL,
	"catatan" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "journal" ADD CONSTRAINT "journal_schedule_id_schedule_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedule"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "journal" ADD CONSTRAINT "journal_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
