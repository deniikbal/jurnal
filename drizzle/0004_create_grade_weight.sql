CREATE TABLE "grade_weight" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"weight" integer NOT NULL,
	"subject_id" text NOT NULL,
	"status" text DEFAULT 'aktif' NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "grade_weight" ADD CONSTRAINT "grade_weight_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "grade_weight" ADD CONSTRAINT "grade_weight_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
