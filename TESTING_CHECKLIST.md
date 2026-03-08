# 🧪 TESTING & VERIFICATION CHECKLIST
## Car Rental Management System - Design A Refactoring

---

## **PRE-DEPLOYMENT STEPS**

### **1. Run Data Migration**
```bash
cd backend
npx prisma migrate deploy
```

This will:
- ✅ Migrate existing vehicle maintenance data to maintenance table
- ✅ Add unique constraint to maintenance table
- ✅ Remove maintenance fields from vehicle table

### **2. Regenerate Prisma Client**
```bash
npx prisma generate
```

### **3. Restart Backend Server**
```bash
npm run dev
```

### **4. Restart Frontend Server**
```bash
cd ../frontend
npm run dev
```

---

## **VERIFICATION TESTS**

### **TEST 1: Vehicle Creation**
**Steps:**
1. Navigate to Vehicles page
2. Click "Add Vehicle" button
3. Fill in vehicle details (brand, model, license plate, etc.)
4. Fill in maintenance fields:
   - Insurance Expiry: [future date]
   - Next Oil Change: 25000 km
   - Next Service Date: [future date]
5. Upload vehicle images
6. Click "Create Vehicle"

**Expected Result:**
- ✅ Vehicle created successfully
- ✅ Vehicle appears in vehicles list
- ✅ Maintenance records created in maintenance table
- ✅ No errors in console

**Verification Query:**
```sql
SELECT * FROM vehicle WHERE licensePlate = '[test-plate]';
-- Should show: currentMileage only, NO maintenance fields

SELECT * FROM maintenance WHERE vehicleId = [vehicle-id];
-- Should show: 3 records (INSURANCE, OIL_CHANGE, SERVICE)
```

---

### **TEST 2: Vehicle Update**
**Steps:**
1. Navigate to Vehicles page
2. Click "Edit" on an existing vehicle
3. Update currentMileage to 20000
4. Update maintenance fields:
   - Next Oil Change: 30000 km
   - Next Service Date: [new date]
   - Insurance Expiry: [new date]
5. Click "Update Vehicle"

**Expected Result:**
- ✅ Vehicle updated successfully
- ✅ currentMileage updated in vehicle table
- ✅ Maintenance records updated in maintenance table
- ✅ No errors in console

**Verification Query:**
```sql
SELECT currentMileage FROM vehicle WHERE id = [vehicle-id];
-- Should show: 20000

SELECT type, dueDate, dueMileage FROM maintenance 
WHERE vehicleId = [vehicle-id] AND isCompleted = false;
-- Should show: updated maintenance records
```

---

### **TEST 3: Reservation Check-Out**
**Steps:**
1. Navigate to Reservations page
2. Create a new reservation
3. Change reservation status to "CONFIRMED"
4. Change reservation status to "ONGOING" (triggers check-out)

**Expected Result:**
- ✅ Check-out record created
- ✅ Vehicle status changed to "RENTED"
- ✅ mileageOut recorded
- ✅ No errors in console

**Verification Query:**
```sql
SELECT * FROM checkout WHERE reservationId = [reservation-id];
-- Should show: checkout record with mileageOut

SELECT status FROM vehicle WHERE id = [vehicle-id];
-- Should show: RENTED
```

---

### **TEST 4: Reservation Check-In (Mileage Update)**
**Steps:**
1. Navigate to Reservations page
2. Find an ONGOING reservation
3. Click "Check In" or change status to "COMPLETED"
4. Enter mileageIn: 25000 km
5. Enter damage report (optional)
6. Submit check-in

**Expected Result:**
- ✅ Check-in record created
- ✅ Vehicle currentMileage updated to 25000
- ✅ Vehicle status changed to "AVAILABLE"
- ✅ Maintenance alerts generated if mileage >= due mileage
- ✅ No errors in console

**Verification Query:**
```sql
SELECT currentMileage FROM vehicle WHERE id = [vehicle-id];
-- Should show: 25000

SELECT * FROM checkin WHERE reservationId = [reservation-id];
-- Should show: checkin record with mileageIn = 25000

SELECT * FROM maintenance 
WHERE vehicleId = [vehicle-id] 
  AND type = 'OIL_CHANGE' 
  AND isCompleted = false;
-- Should show: alert if currentMileage >= dueMileage
```

---

### **TEST 5: Maintenance Alert Generation**
**Steps:**
1. Create a vehicle with currentMileage = 24000
2. Create maintenance record: OIL_CHANGE at 25000 km
3. Check-in a reservation with mileageIn = 25500
4. Navigate to Maintenance page

**Expected Result:**
- ✅ Oil change alert appears in Maintenance page
- ✅ Alert shows: Current: 25500 km, Due at: 25000 km
- ✅ Alert status: OVERDUE
- ✅ No errors in console

**Verification Query:**
```sql
SELECT v.currentMileage, m.dueMileage, m.type
FROM vehicle v
JOIN maintenance m ON v.id = m.vehicleId
WHERE v.id = [vehicle-id] 
  AND m.type = 'OIL_CHANGE' 
  AND m.isCompleted = false;
-- Should show: currentMileage >= dueMileage
```

---

### **TEST 6: Mark Maintenance Complete**
**Steps:**
1. Navigate to Maintenance page
2. Find an overdue alert
3. Click "Mark as Complete"
4. Update maintenance fields:
   - Current Mileage: 26000
   - Next Oil Change: 31000 km
   - Next Service Date: [future date]
   - Insurance Expiry: [future date]
5. Click "Update"

**Expected Result:**
- ✅ Old maintenance records marked as completed
- ✅ New maintenance records created
- ✅ Vehicle currentMileage updated
- ✅ Alert removed from Maintenance page
- ✅ No errors in console

**Verification Query:**
```sql
SELECT isCompleted FROM maintenance 
WHERE vehicleId = [vehicle-id] AND id = [old-maintenance-id];
-- Should show: isCompleted = true

SELECT * FROM maintenance 
WHERE vehicleId = [vehicle-id] AND isCompleted = false;
-- Should show: new maintenance records

SELECT currentMileage FROM vehicle WHERE id = [vehicle-id];
-- Should show: 26000
```

---

### **TEST 7: Date-Based Maintenance Alerts**
**Steps:**
1. Create a vehicle
2. Create maintenance record: SERVICE with dueDate = today
3. Navigate to Maintenance page

**Expected Result:**
- ✅ Service alert appears
- ✅ Alert shows due date
- ✅ Alert status: OVERDUE
- ✅ No errors in console

**Verification Query:**
```sql
SELECT * FROM maintenance 
WHERE vehicleId = [vehicle-id] 
  AND type = 'SERVICE' 
  AND dueDate <= NOW() 
  AND isCompleted = false;
-- Should show: service maintenance record
```

---

### **TEST 8: Insurance Expiry Alert**
**Steps:**
1. Create a vehicle
2. Create maintenance record: INSURANCE with dueDate = yesterday
3. Navigate to Maintenance page

**Expected Result:**
- ✅ Insurance alert appears
- ✅ Alert shows due date
- ✅ Alert status: OVERDUE
- ✅ No errors in console

---

## **REGRESSION TESTS**

### **TEST 9: Existing Reservations Still Work**
**Steps:**
1. Navigate to Reservations page
2. View existing reservations
3. Update reservation status
4. Update payment status

**Expected Result:**
- ✅ All reservation operations work
- ✅ No errors in console

---

### **TEST 10: Vehicle Status Management**
**Steps:**
1. Create reservation → Vehicle status: RESERVED
2. Start reservation → Vehicle status: RENTED
3. Complete reservation → Vehicle status: AVAILABLE
4. Cancel reservation → Vehicle status: AVAILABLE

**Expected Result:**
- ✅ Vehicle status updates correctly
- ✅ No errors in console

---

## **DATA INTEGRITY CHECKS**

### **CHECK 1: No Orphaned Maintenance Records**
```sql
SELECT m.* FROM maintenance m
LEFT JOIN vehicle v ON m.vehicleId = v.id
WHERE v.id IS NULL;
-- Should return: 0 rows
```

### **CHECK 2: No Duplicate Active Maintenance**
```sql
SELECT vehicleId, type, COUNT(*) as count
FROM maintenance
WHERE isCompleted = false
GROUP BY vehicleId, type
HAVING count > 1;
-- Should return: 0 rows (unique constraint prevents this)
```

### **CHECK 3: All Vehicles Have Valid Mileage**
```sql
SELECT * FROM vehicle WHERE currentMileage < 0;
-- Should return: 0 rows
```

### **CHECK 4: Maintenance Records Have Valid Data**
```sql
SELECT * FROM maintenance 
WHERE (type = 'OIL_CHANGE' AND dueMileage IS NULL)
   OR (type IN ('SERVICE', 'INSURANCE') AND dueDate IS NULL);
-- Should return: 0 rows
```

---

## **PERFORMANCE CHECKS**

### **CHECK 5: Query Performance**
```sql
EXPLAIN SELECT v.*, m.*
FROM vehicle v
LEFT JOIN maintenance m ON v.id = m.vehicleId AND m.isCompleted = false
WHERE v.status = 'AVAILABLE';
-- Should use indexes efficiently
```

---

## **ERROR HANDLING TESTS**

### **TEST 11: Invalid Mileage Update**
**Steps:**
1. Check-in with mileageIn < mileageOut

**Expected Result:**
- ✅ Error message: "Check-in mileage cannot be less than check-out mileage"
- ✅ No database update

---

### **TEST 12: Duplicate License Plate**
**Steps:**
1. Create vehicle with existing license plate

**Expected Result:**
- ✅ Error message: "License plate already exists"
- ✅ No database update

---

## **BROWSER CONSOLE CHECKS**

### **CHECK 6: No Console Errors**
Open browser console and verify:
- ✅ No red errors
- ✅ No 404 errors
- ✅ No undefined variable errors
- ✅ API calls return 200/201 status codes

---

## **FINAL VERIFICATION**

### **Checklist:**
- [ ] All 12 tests passed
- [ ] All 6 data integrity checks passed
- [ ] No console errors
- [ ] No database errors
- [ ] Vehicle creation works
- [ ] Vehicle update works
- [ ] Reservation check-in/out works
- [ ] Maintenance alerts work
- [ ] Mark maintenance complete works
- [ ] All existing features still work

---

## **ROLLBACK PLAN (If Issues Found)**

If critical issues are discovered:

1. **Restore vehicle table fields:**
```sql
ALTER TABLE vehicle 
ADD COLUMN nextOilChangeMileage INT NULL,
ADD COLUMN nextServiceDate DATETIME NULL,
ADD COLUMN insuranceExpiryDate DATETIME NULL;
```

2. **Restore data from maintenance table:**
```sql
UPDATE vehicle v
LEFT JOIN maintenance m ON v.id = m.vehicleId AND m.type = 'OIL_CHANGE' AND m.isCompleted = false
SET v.nextOilChangeMileage = m.dueMileage;

UPDATE vehicle v
LEFT JOIN maintenance m ON v.id = m.vehicleId AND m.type = 'SERVICE' AND m.isCompleted = false
SET v.nextServiceDate = m.dueDate;

UPDATE vehicle v
LEFT JOIN maintenance m ON v.id = m.vehicleId AND m.type = 'INSURANCE' AND m.isCompleted = false
SET v.insuranceExpiryDate = m.dueDate;
```

3. **Revert code changes using git:**
```bash
git revert [commit-hash]
```

---

## **SUCCESS CRITERIA**

✅ **Refactoring is successful if:**
1. All tests pass
2. No data loss
3. No functionality broken
4. Maintenance table is single source of truth
5. Vehicle table only stores currentMileage
6. Performance is maintained or improved
7. No console errors
8. User experience unchanged
