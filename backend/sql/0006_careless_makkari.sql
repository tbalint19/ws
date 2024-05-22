ALTER TABLE "answer" DROP CONSTRAINT "answer_question_id_product_question_id_fk";
--> statement-breakpoint
ALTER TABLE "bundle" DROP CONSTRAINT "bundle_product_id_product_id_fk";
--> statement-breakpoint
ALTER TABLE "bundle_of_offer" DROP CONSTRAINT "bundle_of_offer_bundle_id_bundle_id_fk";
--> statement-breakpoint
ALTER TABLE "category_to_product" DROP CONSTRAINT "category_to_product_product_id_product_id_fk";
--> statement-breakpoint
ALTER TABLE "product_at_location" DROP CONSTRAINT "product_at_location_product_id_product_id_fk";
--> statement-breakpoint
ALTER TABLE "product_image" DROP CONSTRAINT "product_image_product_id_product_id_fk";
--> statement-breakpoint
ALTER TABLE "product_link" DROP CONSTRAINT "product_link_product_id_product_id_fk";
--> statement-breakpoint
ALTER TABLE "product_property" DROP CONSTRAINT "product_property_product_id_product_id_fk";
--> statement-breakpoint
ALTER TABLE "product_question" DROP CONSTRAINT "product_question_product_id_product_id_fk";
--> statement-breakpoint
ALTER TABLE "product_review" DROP CONSTRAINT "product_review_product_id_product_id_fk";
--> statement-breakpoint
ALTER TABLE "product_suggestion" DROP CONSTRAINT "product_suggestion_product_id_product_id_fk";
--> statement-breakpoint
ALTER TABLE "topup" DROP CONSTRAINT "topup_product_at_location_id_product_at_location_id_fk";
--> statement-breakpoint
ALTER TABLE "product_at_location" ADD COLUMN "expires" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "answer" ADD CONSTRAINT "answer_question_id_product_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "product_question"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bundle" ADD CONSTRAINT "bundle_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bundle_of_offer" ADD CONSTRAINT "bundle_of_offer_bundle_id_bundle_id_fk" FOREIGN KEY ("bundle_id") REFERENCES "bundle"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "category_to_product" ADD CONSTRAINT "category_to_product_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_at_location" ADD CONSTRAINT "product_at_location_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_link" ADD CONSTRAINT "product_link_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_property" ADD CONSTRAINT "product_property_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_question" ADD CONSTRAINT "product_question_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_review" ADD CONSTRAINT "product_review_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_suggestion" ADD CONSTRAINT "product_suggestion_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "topup" ADD CONSTRAINT "topup_product_at_location_id_product_at_location_id_fk" FOREIGN KEY ("product_at_location_id") REFERENCES "product_at_location"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
