CREATE TABLE IF NOT EXISTS "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_id" text NOT NULL,
	"username" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bundle" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"name" text,
	"multiplier" numeric(12, 3),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bundle_of_offer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bundle_id" uuid NOT NULL,
	"offer_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"unit" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "offer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"currency" text NOT NULL,
	"available_before" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"model" text,
	"description" text NOT NULL,
	"version_of" uuid,
	"available_amount" numeric(15, 3),
	"display_unit" text,
	"gross_weight_of_unit_in_kg" numeric(15, 3),
	"net_weight_of_unit_in_kg" numeric(15, 3),
	"gross_volume_of_unit_in_liter" numeric(15, 3),
	"net_volume_of_unit_in_liter" numeric(15, 3),
	"gross_width_in_meter" numeric(12, 3),
	"net_width_in_meter" numeric(12, 3),
	"gross_height_in_meter" numeric(12, 3),
	"net_height_in_meter" numeric(12, 3),
	"gross_length_in_meter" numeric(12, 3),
	"net_length_in_meter" numeric(12, 3),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_image" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"product_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_link" (
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
CREATE TABLE IF NOT EXISTS "product_property" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"product_id" uuid NOT NULL,
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
CREATE TABLE IF NOT EXISTS "product_review" (
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
DO $$ BEGIN
 ALTER TABLE "bundle" ADD CONSTRAINT "bundle_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bundle_of_offer" ADD CONSTRAINT "bundle_of_offer_bundle_id_bundle_id_fk" FOREIGN KEY ("bundle_id") REFERENCES "bundle"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bundle_of_offer" ADD CONSTRAINT "bundle_of_offer_offer_id_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "offer"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product" ADD CONSTRAINT "product_version_of_product_id_fk" FOREIGN KEY ("version_of") REFERENCES "product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_link" ADD CONSTRAINT "product_link_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_property" ADD CONSTRAINT "product_property_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_question" ADD CONSTRAINT "product_question_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_review" ADD CONSTRAINT "product_review_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_suggestion" ADD CONSTRAINT "product_suggestion_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_suggestion" ADD CONSTRAINT "product_suggestion_suggestion_id_product_id_fk" FOREIGN KEY ("suggestion_id") REFERENCES "product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
