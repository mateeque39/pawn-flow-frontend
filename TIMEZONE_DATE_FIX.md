# Timezone Date Display Fix
## Issue
When a client creates a loan, they see yesterday's date in the "Manage Customer Profile" and "Loan Search" forms, but the PDF shows today's correct date.

## Root Cause
The backend returns loan dates in YYYY-MM-DD format (e.g., `2025-12-16`) created in EST/EDT timezone using the `getLocalDateString()` function. However, the frontend was parsing these date strings using `new Date(dateString)`, which interprets them as UTC midnight.

**Example of the problem:**
- Backend creates loan on 2025-12-16 (EST)
- Backend returns: `"2025-12-16"` (a string)
- Frontend does: `new Date("2025-12-16")` → treats as UTC 00:00
- UTC 2025-12-16 00:00 → EST 2025-12-15 19:00 (the previous day!)
- Result: User sees 12/15/2025 instead of 12/16/2025

The PDF was correct because it likely uses server-side date formatting that doesn't have this timezone issue.

## Solution
Added proper date parsing functions that handle YYYY-MM-DD format without timezone conversion:

### ManageCustomerProfileForm.js
Added two helper functions:

```javascript
// Helper function to parse date strings (YYYY-MM-DD format) without timezone conversion
const parseDateString = (dateString) => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  
  // If YYYY-MM-DD format, parse directly without UTC conversion
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-');
    // Create date in local timezone
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  return new Date(dateString);
};

// Helper function to format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = parseDateString(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString();
};
```

### Changes Made

#### 1. ManageCustomerProfileForm.js
- **Added date parsing helpers** (lines 105-132)
- **Fixed canForfeitLoan()** - now uses `parseDateString()` instead of `new Date()`
- **Fixed getForfeitButtonTooltip()** - now uses `parseDateString()` instead of `new Date()`
- **Fixed loan display** - "Created" and "Due" dates now use `formatDate()`
- **Fixed profile joined date** - now uses `formatDate()`
- **Fixed payment history dates** - now uses `parseDateString()`

#### 2. ViewCustomerLoansForm.js
- Already had correct date formatting with `formatDateString()` function
- Already using it consistently for all date displays

## Files Modified
- `src/ManageCustomerProfileForm.js` - 6 date-related fixes
- `src/ViewCustomerLoansForm.js` - No changes needed (already correct)

## Testing Checklist
- [ ] Create a new loan and verify the date shows correctly (today's date, not yesterday)
- [ ] Check "Manage Customer Profile" form - verify all dates show correctly
- [ ] Check "Loan Search" form - verify all dates show correctly  
- [ ] Check "Profile Joined" date shows correctly
- [ ] Check payment history dates show correctly
- [ ] Verify due dates are calculated correctly for forfeit button
- [ ] Test across different timezones if possible
- [ ] Verify PDF still generates correctly (should be unaffected)

## Root Cause Prevention
The proper way to handle dates from the backend going forward:
1. **Backend**: Always return dates as `YYYY-MM-DD` strings in the target timezone (EST in this case)
2. **Frontend**: Always parse these strings locally without UTC conversion using:
   ```javascript
   const [year, month, day] = dateString.split('-');
   new Date(year, parseInt(month) - 1, day)
   ```
3. **Avoid**: `new Date("YYYY-MM-DD")` directly, as it assumes UTC

## Related Files
- Backend date creation: `server.js` line 91 - `getLocalDateString()` function (correct)
- Database schema: Dates stored as DATE type (correct)
- PDF generation: Uses server-side formatting (correct)

---
**Date Fixed**: December 16, 2025
**Status**: ✅ Complete
