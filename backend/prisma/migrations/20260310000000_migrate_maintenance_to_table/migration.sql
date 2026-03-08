-- Migration: Move maintenance data from vehicle table to maintenance table
-- This ensures no data loss before removing vehicle table maintenance fields

-- Step 1: Migrate nextOilChangeMileage to maintenance table (OIL_CHANGE)
INSERT INTO maintenance (vehicleId, type, dueDate, dueMileage, isCompleted)
SELECT 
  id as vehicleId,
  'OIL_CHANGE' as type,
  NOW() as dueDate,
  nextOilChangeMileage as dueMileage,
  false as isCompleted
FROM vehicle
WHERE nextOilChangeMileage IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM maintenance m 
    WHERE m.vehicleId = vehicle.id 
      AND m.type = 'OIL_CHANGE' 
      AND m.isCompleted = false
  );

-- Step 2: Migrate nextServiceDate to maintenance table (SERVICE)
INSERT INTO maintenance (vehicleId, type, dueDate, isCompleted)
SELECT 
  id as vehicleId,
  'SERVICE' as type,
  nextServiceDate as dueDate,
  false as isCompleted
FROM vehicle
WHERE nextServiceDate IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM maintenance m 
    WHERE m.vehicleId = vehicle.id 
      AND m.type = 'SERVICE' 
      AND m.isCompleted = false
  );

-- Step 3: Migrate insuranceExpiryDate to maintenance table (INSURANCE)
INSERT INTO maintenance (vehicleId, type, dueDate, isCompleted)
SELECT 
  id as vehicleId,
  'INSURANCE' as type,
  insuranceExpiryDate as dueDate,
  false as isCompleted
FROM vehicle
WHERE insuranceExpiryDate IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM maintenance m 
    WHERE m.vehicleId = vehicle.id 
      AND m.type = 'INSURANCE' 
      AND m.isCompleted = false
  );
