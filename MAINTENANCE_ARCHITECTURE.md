# 🏗️ MAINTENANCE ENHANCEMENT - ARCHITECTURE DIAGRAM

## **System Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                         APP.JSX                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              MAINTENANCE PROVIDER (Context)                │  │
│  │                                                            │  │
│  │  State:                                                    │  │
│  │  • alerts: []                                              │  │
│  │  • loading: boolean                                        │  │
│  │  • hiddenAlertIds: [] (from localStorage)                 │  │
│  │                                                            │  │
│  │  Functions:                                                │  │
│  │  • loadAlerts()        - Fetch & process alerts           │  │
│  │  • refreshAlerts()     - Manual refresh                   │  │
│  │  • hideAlert(id)       - Front-end removal                │  │
│  │  • markAsComplete(id)  - Update after completion          │  │
│  │                                                            │  │
│  │  Auto-refresh: Every 60 seconds                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│              ┌───────────────┴───────────────┐                  │
│              │                               │                  │
│              ▼                               ▼                  │
│  ┌─────────────────────┐       ┌─────────────────────────┐    │
│  │  MAINTENANCE BELL   │       │   MAINTENANCE PAGE      │    │
│  │   (Header Icon)     │       │   (Full Interface)      │    │
│  └─────────────────────┘       └─────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## **Component Interaction Flow**

```
┌──────────────────────────────────────────────────────────────────┐
│                    USER INTERACTIONS                              │
└──────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│ Click Bell   │    │ Apply Filters    │    │ Click X      │
│ Icon         │    │ (Status/Type)    │    │ Button       │
└──────────────┘    └──────────────────┘    └──────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│ Show         │    │ Filter History   │    │ hideAlert()  │
│ Dropdown     │    │ useMemo          │    │              │
└──────────────┘    └──────────────────┘    └──────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│ Display      │    │ Update Display   │    │ Save to      │
│ Pending      │    │ Instantly        │    │ localStorage │
│ Alerts       │    │                  │    │              │
└──────────────┘    └──────────────────┘    └──────────────┘
```

---

## **Data Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA SOURCES                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  vehicleAPI      │
                    │  .getAll()       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Vehicles with   │
                    │  Maintenance[]   │
                    └──────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │     MAINTENANCE CONTEXT PROCESSING      │
        │                                         │
        │  1. Filter active maintenance           │
        │     (isCompleted = false)               │
        │                                         │
        │  2. Check if overdue:                   │
        │     • Oil: mileage >= dueMileage        │
        │     • Other: today >= dueDate           │
        │                                         │
        │  3. Exclude hidden alerts               │
        │     (from localStorage)                 │
        │                                         │
        │  4. Generate alert objects              │
        └─────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  alerts: []      │
                    │  alertCount: N   │
                    └──────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
        ┌──────────────┐          ┌──────────────────┐
        │ Bell Icon    │          │ Maintenance Page │
        │ (N alerts)   │          │ (Full History)   │
        └──────────────┘          └──────────────────┘
```

---

## **Filter Logic Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│                    ALL HISTORY DATA                              │
│  [Oil Change, Insurance, Service, Oil Change, Insurance, ...]   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  USER SELECTS:   │
                    │  Status: Pending │
                    │  Type: Insurance │
                    └──────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │         FILTER FUNCTION (useMemo)       │
        │                                         │
        │  allHistory.filter(item => {            │
        │    const statusMatch =                  │
        │      statusFilter === 'All' ||          │
        │      item.status === 'Pending';         │
        │                                         │
        │    const typeMatch =                    │
        │      typeFilter === 'All' ||            │
        │      item.type === 'INSURANCE';         │
        │                                         │
        │    return statusMatch && typeMatch;     │
        │  })                                     │
        └─────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  FILTERED RESULT │
                    │  [Insurance 1,   │
                    │   Insurance 2]   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  DISPLAY IN UI   │
                    └──────────────────┘
```

---

## **Mark Complete Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│                USER CLICKS "MARK COMPLETE"                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Open Modal      │
                    │  with Current    │
                    │  Values          │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  User Updates:   │
                    │  • Mileage       │
                    │  • Oil Change    │
                    │  • Service Date  │
                    │  • Insurance     │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Submit Form     │
                    └──────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
        ┌──────────────┐          ┌──────────────────┐
        │ vehicleAPI   │          │ maintenanceAPI   │
        │ .update()    │          │ .update()        │
        │ (mileage)    │          │ (maintenance)    │
        └──────────────┘          └──────────────────┘
                │                           │
                └─────────────┬─────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ markAsComplete() │
                    │ in Context       │
                    └──────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
        ┌──────────────┐          ┌──────────────────┐
        │ Remove from  │          │ Refresh Context  │
        │ alerts[]     │          │ loadAlerts()     │
        └──────────────┘          └──────────────────┘
                │                           │
                └─────────────┬─────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  INSTANT UI UPDATE (No Page Reload)     │
        │  • Bell icon count decreases            │
        │  • Alert removed from pending list      │
        │  • History updated                      │
        └─────────────────────────────────────────┘
```

---

## **Front-End Removal Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER CLICKS X BUTTON                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ hideAlert(id)    │
                    │ in Context       │
                    └──────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
        ┌──────────────┐          ┌──────────────────┐
        │ Add to       │          │ Save to          │
        │ hiddenIds[]  │          │ localStorage     │
        └──────────────┘          └──────────────────┘
                │                           │
                └─────────────┬─────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Remove from      │
                    │ Display          │
                    └──────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  RESULT:                                 │
        │  • Item hidden from view                 │
        │  • Persists across page refreshes        │
        │  • Database unchanged                    │
        │  • Can be restored by clearing storage   │
        └─────────────────────────────────────────┘
```

---

## **State Management Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                    MAINTENANCE CONTEXT                           │
│                                                                  │
│  Global State (Shared Across App):                              │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ alerts: [                                              │    │
│  │   {                                                    │    │
│  │     id: "OIL_CHANGE_1_5",                              │    │
│  │     vehicle: {...},                                    │    │
│  │     type: "OIL_CHANGE",                                │    │
│  │     status: "Pending",                                 │    │
│  │     ...                                                │    │
│  │   },                                                   │    │
│  │   ...                                                  │    │
│  │ ]                                                      │    │
│  │                                                        │    │
│  │ loading: false                                         │    │
│  │ alertCount: 3                                          │    │
│  │ hiddenAlertIds: ["OIL_CHANGE_2_8", ...]                │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Functions (Available to All Components):                       │
│  • loadAlerts()                                                 │
│  • refreshAlerts()                                              │
│  • hideAlert(id)                                                │
│  • markAsComplete(id)                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
┌─────────────────────────┐   ┌─────────────────────────────┐
│  MAINTENANCE BELL       │   │  MAINTENANCE PAGE           │
│                         │   │                             │
│  Uses:                  │   │  Uses:                      │
│  • alerts               │   │  • alerts                   │
│  • alertCount           │   │  • refreshAlerts()          │
│                         │   │  • hideAlert()              │
│  Local State:           │   │  • markAsComplete()         │
│  • showDropdown         │   │                             │
│                         │   │  Local State:               │
│                         │   │  • allHistory               │
│                         │   │  • statusFilter             │
│                         │   │  • typeFilter               │
│                         │   │  • editModal                │
└─────────────────────────┘   └─────────────────────────────┘
```

---

## **Performance Optimization**

```
┌─────────────────────────────────────────────────────────────────┐
│                   OPTIMIZATION STRATEGIES                        │
└─────────────────────────────────────────────────────────────────┘

1. MEMOIZATION (useMemo)
   ┌────────────────────────────────────────┐
   │ filteredHistory = useMemo(() => {      │
   │   return allHistory.filter(...)        │
   │ }, [allHistory, statusFilter, type])   │
   │                                        │
   │ ✅ Only recalculates when deps change  │
   │ ✅ Prevents unnecessary filtering      │
   └────────────────────────────────────────┘

2. CALLBACKS (useCallback)
   ┌────────────────────────────────────────┐
   │ const hideAlert = useCallback(() => {  │
   │   // function logic                    │
   │ }, [hiddenAlertIds])                   │
   │                                        │
   │ ✅ Prevents function recreation        │
   │ ✅ Reduces child re-renders            │
   └────────────────────────────────────────┘

3. CONTEXT OPTIMIZATION
   ┌────────────────────────────────────────┐
   │ • Single context for all alerts        │
   │ • Auto-refresh every 60s (not 5s)      │
   │ • Efficient filtering logic            │
   │ • localStorage for persistence         │
   │                                        │
   │ ✅ Minimal API calls                   │
   │ ✅ Fast UI updates                     │
   └────────────────────────────────────────┘
```

---

## **Error Handling**

```
┌─────────────────────────────────────────────────────────────────┐
│                     ERROR SCENARIOS                              │
└─────────────────────────────────────────────────────────────────┘

1. API FAILURE
   ┌────────────────────────────────────────┐
   │ try {                                  │
   │   await vehicleAPI.getAll()            │
   │ } catch (error) {                      │
   │   console.error(error)                 │
   │   // Context continues with old data   │
   │ }                                      │
   │                                        │
   │ ✅ Graceful degradation                │
   │ ✅ No app crash                        │
   └────────────────────────────────────────┘

2. LOCALSTORAGE FAILURE
   ┌────────────────────────────────────────┐
   │ const stored = localStorage.getItem()  │
   │ return stored ? JSON.parse(stored) : []│
   │                                        │
   │ ✅ Fallback to empty array             │
   │ ✅ App continues working               │
   └────────────────────────────────────────┘

3. INVALID DATA
   ┌────────────────────────────────────────┐
   │ if (!vehicle.maintenance) return       │
   │                                        │
   │ ✅ Skip invalid records                │
   │ ✅ No null pointer errors              │
   └────────────────────────────────────────┘
```

---

**Architecture Status:** ✅ PRODUCTION READY
**Complexity:** LOW-MEDIUM
**Maintainability:** HIGH
**Performance:** OPTIMIZED
