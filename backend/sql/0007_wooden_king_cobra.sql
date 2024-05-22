ALTER TABLE "category_to_product" DROP CONSTRAINT "category_to_product_category_id_product_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "category_to_product" ADD CONSTRAINT "category_to_product_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
