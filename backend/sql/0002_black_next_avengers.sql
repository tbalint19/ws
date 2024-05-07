ALTER TABLE "bundle" ALTER COLUMN "multiplier" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "product_property" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "bundle_of_offer" DROP COLUMN IF EXISTS "unit";