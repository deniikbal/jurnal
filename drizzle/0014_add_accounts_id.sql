ALTER TABLE "accounts" ADD COLUMN "id" text;--> statement-breakpoint
UPDATE "accounts" SET "id" = gen_random_uuid()::text WHERE "id" IS NULL;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_provider_providerAccountId_pk";--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_id_pk" PRIMARY KEY("id");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_idx" ON "accounts" USING btree ("provider","provider_account_id");
