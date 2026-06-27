CREATE TABLE "schedule" (
	"id" text PRIMARY KEY NOT NULL,
	"day" text NOT NULL,
	"jam_ke" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"subject_id" text NOT NULL,
	"classroom_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_classroom_id_classroom_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classroom"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
