CREATE TABLE IF NOT EXISTS "bill" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "topup" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"available_amount" numeric(15, 3) DEFAULT '0' NOT NULL,
	"bill_url" text,
	"price" numeric(12, 3),
	"currency" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3)
);
--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "available_amount" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "admin" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "admin" ADD COLUMN "updated_at" timestamp (3);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "topup" ADD CONSTRAINT "topup_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
