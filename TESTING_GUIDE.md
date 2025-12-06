# Testing Guide - Customer Profile Field Display Fix

## How to Test the Fix

### Step 1: Login to the Application
1. Go to `http://localhost:3001` in your browser
2. Log in with your credentials

### Step 2: Navigate to Manage Customer Profile
1. From the main menu, click "Manage Customer Profile"
2. You should see the search form

### Step 3: Search for a Customer
1. Choose search type (e.g., "Phone Number")
2. Enter search value (e.g., "555-1234" or similar)
3. Click "Search"

### Step 4: Verify Field Display
After searching, verify that the following fields display correctly:

**Expected Results for Susan (example customer):**
- ✅ Name: Should display "Susan [LastName]" (not empty)
- ✅ Customer ID: Should display the customer ID number
- ✅ Phone: Should display either home or mobile phone (not empty)
- ✅ Email: Should display the email address
- ✅ Address: Should display street, city, state, zip (not "N/A")
- ✅ ID Type & Number: Should display identification info (or "N/A" if missing)
- ✅ Joined Date: Should display proper date like "12/15/2023" (not "Invalid Date")

### Step 5: Browser Console Check
1. Open Browser Developer Tools (F12)
2. Go to "Console" tab
3. Search for a customer again
4. Look for log entry: "Customer search response sample:"
5. This shows you the actual field names the backend is returning
6. Verify if backend returns `first_name` vs `firstName`, etc.

### Step 6: Multiple Search Tests
Test with different search parameters:
- **Search by Phone**: Try different phone numbers
- **Search by Name**: Try different customer names  
- **Search by Customer ID**: Try specific customer IDs

## Expected Behavior After Fix

### ✅ FIXED Issues
| Issue | Before | After |
|-------|--------|-------|
| Name field | Empty | Shows "FirstName LastName" |
| Phone fields | Empty | Shows home or mobile phone |
| Address | "N/A" | Shows complete address with city, state, zip |
| Joined date | "Invalid Date" | Shows proper formatted date like "12/15/2023" |
| Customer ID | 2 | 2 (unchanged, but other fields now work) |
| Email | Working | Still works correctly |

### What's Different Now
- Frontend now accepts BOTH camelCase (`firstName`) AND snake_case (`first_name`) field names
- If a field is missing or empty in one naming convention, it checks the alternative
- Dates are validated before formatting to prevent "Invalid Date" errors
- Address components are concatenated intelligently to avoid "undefined" in display

## Troubleshooting

### Fields Still Missing?
1. Check browser Console for "Customer search response sample"
2. If the field isn't in the response, it's a backend issue
3. Backend may need to return those fields

### Date Still Shows "Invalid Date"?
1. Check if `createdAt` or similar field exists in console log
2. If exists, check if date format is valid (ISO 8601 format preferred)
3. Backend may need to fix date format

### Name Still Shows Empty?
1. Open browser Console
2. Search for "Customer search response sample" log
3. Look for `first_name`, `firstName`, `firstname` fields
4. If none exist, backend isn't returning name fields

## Debug Mode

To see more detailed information:

1. **View Raw API Response**:
   - Open DevTools Network tab (F12 → Network)
   - Perform a customer search
   - Find the `/customers/search-*` or `/customers/{id}` request
   - Click on it and go to "Response" tab
   - See exact JSON returned by backend

2. **View Normalized Profile**:
   - Open DevTools Console
   - Look for the "Customer search response sample" log
   - This shows what the frontend received and is now displaying

## Files Modified
- `ManageCustomerProfileForm.js` - Main search and display component
- `SearchCustomerProfileForm.js` - Search form component  
- `ViewCustomerLoansForm.js` - Loans display component
- `CreateCustomerProfileForm.js` - New profile display component

## Performance Impact
✅ **Minimal** - Field fallback check is only done once per profile during search/select, not on every render.

## Success Indicators
- ✅ Customer name displays (not empty)
- ✅ Phone number displays (not empty)
- ✅ Date displays properly formatted (not "Invalid Date")
- ✅ Address displays with all available components
- ✅ No console errors when displaying profiles
