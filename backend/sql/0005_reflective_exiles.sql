CREATE TABLE IF NOT EXISTS "product_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"diplay" text,
	"summary" text,
	"img_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_question" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"star" integer NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_suggestion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"suggestion_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3)
);
--> statement-breakpoint
ALTER TABLE "bundles" ALTER COLUMN "price" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bundles" ALTER COLUMN "currency" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product_images" ALTER COLUMN "url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product_images" ALTER COLUMN "product_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product_of_bundles" ALTER COLUMN "product_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product_of_bundles" ALTER COLUMN "bundle_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product_of_bundles" ALTER COLUMN "amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product_of_bundles" ALTER COLUMN "unit" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bundles" ADD COLUMN "available_before" timestamp;--> statement-breakpoint
ALTER TABLE "bundles" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "bundles" ADD COLUMN "updated_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "brand" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "model" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "updated_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "product_images" ADD COLUMN "alt" text;--> statement-breakpoint
ALTER TABLE "product_images" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "product_images" ADD COLUMN "updated_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "product_properties" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "product_properties" ADD COLUMN "updated_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "product_of_bundles" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "product_of_bundles" ADD COLUMN "updated_at" timestamp (3);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_links" ADD CONSTRAINT "product_links_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_question" ADD CONSTRAINT "product_question_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_suggestion" ADD CONSTRAINT "product_suggestion_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_suggestion" ADD CONSTRAINT "product_suggestion_suggestion_id_products_id_fk" FOREIGN KEY ("suggestion_id") REFERENCES "products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
