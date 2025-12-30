-- Add category to Listing and PendingListing
ALTER TABLE "Listing"
  ADD COLUMN "category" TEXT NOT NULL DEFAULT 'All';

ALTER TABLE "PendingListing"
  ADD COLUMN "category" TEXT NOT NULL DEFAULT 'All';
