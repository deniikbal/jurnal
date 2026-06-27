CREATE TABLE "classroom" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"wali_kelas" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "classroom" ADD CONSTRAINT "classroom_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;