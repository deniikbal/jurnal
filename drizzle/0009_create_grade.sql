CREATE TABLE "grade" (
	"id" text PRIMARY KEY NOT NULL,
	"schedule_id" text NOT NULL,
	"grade_weight_id" text NOT NULL,
	"grade_weight_name" text NOT NULL,
	"siswa_id" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"subject_id" text NOT NULL,
	"subject_name" text NOT NULL,
	"subject_kode" text,
	"classroom_id" text NOT NULL,
	"classroom_name" text NOT NULL,
	"day" text NOT NULL,
	"jam_ke" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "grade" ADD CONSTRAINT "grade_schedule_id_schedule_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedule"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "grade" ADD CONSTRAINT "grade_grade_weight_id_grade_weight_id_fk" FOREIGN KEY ("grade_weight_id") REFERENCES "public"."grade_weight"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "grade" ADD CONSTRAINT "grade_siswa_id_siswa_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."siswa"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "grade" ADD CONSTRAINT "grade_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
