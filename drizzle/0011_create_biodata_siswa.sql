CREATE TABLE "biodata_siswa" (
	"id" text PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"alamat" text,
	"nohp_ortu" text,
	"nama_ayah" text,
	"nama_ibu" text,
	"status_pernikahan" text,
	"kondisi_keluarga" text,
	"foto_rumah" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "biodata_siswa" ADD CONSTRAINT "biodata_siswa_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
