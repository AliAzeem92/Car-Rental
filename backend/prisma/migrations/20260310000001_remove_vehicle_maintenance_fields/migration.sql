-- Migration: Remove maintenance fields from vehicle table
-- These fields are now stored in the maintenance table only

ALTER TABLE vehicle DROP COLUMN nextOilChangeMileage;
ALTER TABLE vehicle DROP COLUMN nextServiceDate;
ALTER TABLE vehicle DROP COLUMN insuranceExpiryDate;
