ALTER TABLE "product" ADD COLUMN "is_archived" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "product_image" DROP COLUMN IF EXISTS "remote_url";