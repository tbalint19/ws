ALTER TABLE "bundle" ALTER COLUMN "multiplier" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "bundle_of_offer" ALTER COLUMN "amount" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "offer" ALTER COLUMN "price" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "available_amount" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "available_amount" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "gross_weight_of_unit_in_kg" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "net_weight_of_unit_in_kg" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "gross_volume_of_unit_in_liter" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "net_volume_of_unit_in_liter" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "gross_width_in_meter" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "net_width_in_meter" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "gross_height_in_meter" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "net_height_in_meter" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "gross_length_in_meter" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "net_length_in_meter" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "topup" ALTER COLUMN "available_amount" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "topup" ALTER COLUMN "available_amount" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "topup" ALTER COLUMN "price" SET DATA TYPE double precision;