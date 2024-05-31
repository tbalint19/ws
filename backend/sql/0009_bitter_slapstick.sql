ALTER TABLE "offer_of_location" DROP CONSTRAINT "offer_of_location_offer_id_offer_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "offer_of_location" ADD CONSTRAINT "offer_of_location_offer_id_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "offer"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
