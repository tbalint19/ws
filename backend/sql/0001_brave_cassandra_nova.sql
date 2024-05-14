DROP TABLE "bill";--> statement-breakpoint
ALTER TABLE "answer" ALTER COLUMN "question_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "answer" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "location" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product_at_location" ALTER COLUMN "location_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product_at_location" ALTER COLUMN "product_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product_at_location" ALTER COLUMN "amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product_image" ALTER COLUMN "file_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "product_link" ALTER COLUMN "diplay" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "admin" ADD COLUMN "invitation_id" uuid;--> statement-breakpoint
ALTER TABLE "product_image" ADD COLUMN "remote_url" text;--> statement-breakpoint
ALTER TABLE "topup" ADD COLUMN "file_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin" ADD CONSTRAINT "admin_invitation_id_invitation_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "invitation"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "topup" ADD CONSTRAINT "topup_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "product_link" DROP COLUMN IF EXISTS "alt";--> statement-breakpoint
ALTER TABLE "topup" DROP COLUMN IF EXISTS "bill_url";