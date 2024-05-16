ALTER TABLE "product_link" ADD COLUMN "image_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_link" ADD CONSTRAINT "product_link_image_id_file_id_fk" FOREIGN KEY ("image_id") REFERENCES "file"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "product_link" DROP COLUMN IF EXISTS "img_url";