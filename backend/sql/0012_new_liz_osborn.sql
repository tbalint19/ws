ALTER TABLE "product" RENAME COLUMN "version_of" TO "variant_of";--> statement-breakpoint
ALTER TABLE "product" DROP CONSTRAINT "product_version_of_product_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product" ADD CONSTRAINT "product_variant_of_product_id_fk" FOREIGN KEY ("variant_of") REFERENCES "product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
