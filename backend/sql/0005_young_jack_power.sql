CREATE TABLE IF NOT EXISTS "category_to_product" (
	"product_id" uuid,
	"category_id" uuid,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3)
);
--> statement-breakpoint
ALTER TABLE "product_suggestion" ADD COLUMN "content" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "category_to_product" ADD CONSTRAINT "category_to_product_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "category_to_product" ADD CONSTRAINT "category_to_product_category_id_product_id_fk" FOREIGN KEY ("category_id") REFERENCES "product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
