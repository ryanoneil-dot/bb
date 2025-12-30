-- Add contact fields to Listing and PendingListing
ALTER TABLE "Listing"
  ADD COLUMN "contactName" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "contactPhone" TEXT NOT NULL DEFAULT '';

ALTER TABLE "PendingListing"
  ADD COLUMN "contactName" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "contactPhone" TEXT NOT NULL DEFAULT '';
