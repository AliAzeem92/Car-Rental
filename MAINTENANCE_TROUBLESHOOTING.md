# 🔧 MAINTENANCE ENHANCEMENT - TROUBLESHOOTING GUIDE

## **Common Issues & Solutions**

---

## **Issue 1: Bell Icon Not Showing Alerts**

### **Symptoms:**
- Bell icon shows 0 alerts
- Dropdown is empty
- But maintenance page shows pending items

### **Possible Causes:**
1. Context not loaded yet
2. All alerts hidden via X button
3. API error

### **Solutions:**

**Solution A: Check Context Loading**
```javascript
// In browser console
console.log('Context loaded:', window.maintenanceContext)
```

**Solution B: Clear Hidden Alerts**
```javascript
// In browser console
localStorage.removeItem('hiddenMaintenanceAlerts')
// Then refresh page
```

**Solution C: Check API Response**
```javascript
// In browser console (Network tab)
// Look for: GET /api/vehicles
// Status should be 200
// Response should include maintenance array
```

---

## **Issue 2: Filters Not Working**

### **Symptoms:**
- Selecting filters doesn't change displayed items
- All items still visible

### **Possible Causes:**
1. Filter state not updating
2. Data not loaded
3. Filter logic error

### **Solutions:**

**Solution A: Check Filter State**
```javascript
// Add console.log in Maintenance.jsx
console.log('Filters:', { statusFilter, typeFilter })
console.log('Filtered count:', filteredHistory.length)
```

**Solution B: Clear Filters**
```javascript
// Click "Clear Filters" button
// Or manually reset:
setStatusFilter('All')
setTypeFilter('All')
```

**Solution C: Verify Data Structure**
```javascript
// In browser console
console.log('All history:', allHistory)
// Check if items have 'status' and 'type' properties
```

---

## **Issue 3: X Button Not Removing Items**

### **Symptoms:**
- Click X button
- Item doesn't disappear
- Or reappears after refresh

### **Possible Causes:**
1. localStorage disabled
2. Context not updating
3. ID mismatch

### **Solutions:**

**Solution A: Check localStorage**
```javascript
// In browser console
try {
  localStorage.setItem('test', 'test')
  localStorage.removeItem('test')
  console.log('localStorage working')
} catch (e) {
  console.error('localStorage disabled:', e)
}
```

**Solution B: Verify Hidden IDs**
```javascript
// In browser console
const hidden = JSON.parse(localStorage.getItem('hiddenMaintenanceAlerts'))
console.log('Hidden alerts:', hidden)
```

**Solution C: Clear and Retry**
```javascript
// In browser console
localStorage.removeItem('hiddenMaintenanceAlerts')
// Then refresh page and try again
```

---

## **Issue 4: Mark Complete Not Updating**

### **Symptoms:**
- Click "Mark Complete"
- Submit form
- Alert still shows in bell/page

### **Possible Causes:**
1. API error
2. Context not refreshing
3. Form validation error

### **Solutions:**

**Solution A: Check API Response**
```javascript
// In browser console (Network tab)
// Look for: PUT /api/vehicles/:id
// Look for: PUT /api/maintenance/update
// Both should return 200
```

**Solution B: Force Context Refresh**
```javascript
// In Maintenance.jsx, after submit:
refreshAlerts() // Should be called automatically
loadHistory()   // Should be called automatically
```

**Solution C: Check Form Data**
```javascript
// Add console.log before submit
console.log('Submitting:', {
  vehicleId: editModal.vehicleId,
  currentMileage: editModal.currentMileage,
  // ... other fields
})
```

---

## **Issue 5: Real-Time Updates Not Working**

### **Symptoms:**
- Mark complete on maintenance page
- Bell icon doesn't update
- Need to refresh page manually

### **Possible Causes:**
1. Context not connected
2. markAsComplete not called
3. Component not re-rendering

### **Solutions:**

**Solution A: Verify Context Connection**
```javascript
// In MaintenanceBell.jsx
const { alerts, alertCount } = useMaintenanceAlerts()
console.log('Bell alerts:', alerts.length)
```

**Solution B: Check markAsComplete Call**
```javascript
// In Maintenance.jsx handleUpdate
markAsComplete(editModal.alertId) // Should be called
console.log('Marked complete:', editModal.alertId)
```

**Solution C: Force Re-render**
```javascript
// In MaintenanceContext.jsx
// After markAsComplete, ensure:
setAlerts(prev => prev.filter(alert => alert.id !== alertId))
refreshAlerts() // This should trigger re-render
```

---

## **Issue 6: Filters Show Wrong Results**

### **Symptoms:**
- Select "Pending" but see "Completed" items
- Select "Oil Change" but see "Insurance" items

### **Possible Causes:**
1. Status calculation wrong
2. Type mapping incorrect
3. Filter logic error

### **Solutions:**

**Solution A: Verify Status Calculation**
```javascript
// In loadHistory function
console.log('Item status:', {
  type: maintenance.type,
  isCompleted: maintenance.isCompleted,
  calculatedStatus: status
})
```

**Solution B: Check Type Mapping**
```javascript
// Verify type values match:
// Database: 'OIL_CHANGE', 'INSURANCE', 'SERVICE'
// Filter: 'Oil Change', 'Insurance', 'Service'
// Mapping should convert correctly
```

**Solution C: Debug Filter Logic**
```javascript
// In filteredHistory useMemo
console.log('Filtering:', {
  statusFilter,
  typeFilter,
  itemStatus: item.status,
  itemType: item.type,
  statusMatch,
  typeMatch
})
```

---

## **Issue 7: Performance Issues**

### **Symptoms:**
- Page slow to load
- Filters lag
- UI freezes

### **Possible Causes:**
1. Too many items
2. Missing memoization
3. Unnecessary re-renders

### **Solutions:**

**Solution A: Check Item Count**
```javascript
// In browser console
console.log('Total history items:', allHistory.length)
// If > 1000, consider pagination
```

**Solution B: Verify Memoization**
```javascript
// Ensure useMemo is used:
const filteredHistory = useMemo(() => {
  return allHistory.filter(...)
}, [allHistory, statusFilter, typeFilter])
```

**Solution C: Profile Performance**
```javascript
// In browser DevTools
// Performance tab → Record → Interact → Stop
// Look for long tasks or excessive renders
```

---

## **Issue 8: localStorage Full**

### **Symptoms:**
- Error: "QuotaExceededError"
- Hidden alerts not saving

### **Possible Causes:**
1. localStorage limit reached (5-10MB)
2. Too many hidden alerts

### **Solutions:**

**Solution A: Check Storage Usage**
```javascript
// In browser console
let total = 0
for (let key in localStorage) {
  total += localStorage[key].length
}
console.log('localStorage usage:', total, 'characters')
```

**Solution B: Clear Old Data**
```javascript
// In browser console
localStorage.removeItem('hiddenMaintenanceAlerts')
// Or clear all:
localStorage.clear()
```

**Solution C: Implement Cleanup**
```javascript
// In MaintenanceContext.jsx
// Limit hidden alerts to last 100:
if (newHiddenIds.length > 100) {
  newHiddenIds = newHiddenIds.slice(-100)
}
```

---

## **Issue 9: Context Not Updating**

### **Symptoms:**
- Changes in one component don't reflect in another
- Bell and page out of sync

### **Possible Causes:**
1. Multiple context instances
2. Context not wrapping components
3. State not updating

### **Solutions:**

**Solution A: Verify Provider Hierarchy**
```jsx
// In App.jsx, ensure:
<MaintenanceProvider>
  <Routes>
    <Route path="/dashboard" element={<DashboardLayout />}>
      {/* All routes here */}
    </Route>
  </Routes>
</MaintenanceProvider>
```

**Solution B: Check Context Usage**
```javascript
// In any component
const context = useMaintenanceAlerts()
console.log('Context available:', !!context)
```

**Solution C: Force Update**
```javascript
// In MaintenanceContext.jsx
// Ensure state updates trigger re-renders:
setAlerts([...newAlerts]) // Create new array reference
```

---

## **Issue 10: Date Formatting Issues**

### **Symptoms:**
- Dates show as "Invalid Date"
- Wrong date displayed

### **Possible Causes:**
1. Invalid date string
2. Timezone issues
3. Format mismatch

### **Solutions:**

**Solution A: Verify Date Format**
```javascript
// In browser console
const date = new Date('2026-03-15')
console.log('Valid date:', !isNaN(date.getTime()))
```

**Solution B: Check API Response**
```javascript
// In Network tab
// Verify date format: "2026-03-15T00:00:00.000Z"
```

**Solution C: Add Date Validation**
```javascript
// In formatDate function
const formatDate = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'
  return d.toLocaleDateString(...)
}
```

---

## **Debugging Checklist**

Before reporting an issue, check:

- [ ] Browser console for errors
- [ ] Network tab for failed API calls
- [ ] localStorage is enabled
- [ ] Context is properly connected
- [ ] Data structure matches expected format
- [ ] Filters are not conflicting
- [ ] Hidden alerts list is not too large
- [ ] Backend is running and accessible
- [ ] Database has valid data

---

## **Quick Fixes**

### **Reset Everything:**
```javascript
// In browser console
localStorage.clear()
location.reload()
```

### **Check Context State:**
```javascript
// In browser console
// Add to MaintenanceContext.jsx temporarily:
window.maintenanceContext = { alerts, loading, alertCount }
// Then check:
console.log(window.maintenanceContext)
```

### **Force Refresh:**
```javascript
// In Maintenance.jsx
useEffect(() => {
  loadHistory()
  refreshAlerts()
}, []) // On mount
```

---

## **Getting Help**

If issue persists:

1. **Check Documentation:**
   - `MAINTENANCE_ENHANCEMENT_SUMMARY.md`
   - `MAINTENANCE_QUICK_START.md`
   - `MAINTENANCE_ARCHITECTURE.md`

2. **Collect Debug Info:**
   ```javascript
   // In browser console
   console.log({
     alerts: window.maintenanceContext?.alerts,
     hidden: localStorage.getItem('hiddenMaintenanceAlerts'),
     filters: { statusFilter, typeFilter },
     historyCount: allHistory?.length
   })
   ```

3. **Check Backend Logs:**
   ```bash
   # In backend terminal
   # Look for errors related to:
   # - GET /api/vehicles
   # - PUT /api/maintenance/update
   ```

---

## **Prevention Tips**

### **Best Practices:**
1. ✅ Always check browser console
2. ✅ Test filters individually before combining
3. ✅ Clear localStorage periodically
4. ✅ Monitor API response times
5. ✅ Keep hidden alerts list reasonable (<100)
6. ✅ Use React DevTools to inspect state
7. ✅ Test on different browsers
8. ✅ Verify backend is running before testing

### **Development Tips:**
1. ✅ Add console.logs during development
2. ✅ Use React DevTools Profiler
3. ✅ Test with large datasets
4. ✅ Test with slow network (throttling)
5. ✅ Test localStorage limits
6. ✅ Test with disabled localStorage
7. ✅ Test concurrent updates
8. ✅ Test error scenarios

---

**Troubleshooting Status:** ✅ COMPREHENSIVE
**Last Updated:** 2026-03-10
**Version:** 1.0.0
