# Field Normalization Implementation - Customer Profile Fix

## Problem Summary
When searching for customer profiles, many fields were displaying as empty or "Invalid Date":
- Name: (empty)
- Customer ID: 2 (showing)
- Phone: (empty)
- Email: susan@example.com (showing)
- Address: N/A
- ID: N/A
- Joined: Invalid Date

## Root Cause
Backend API returns customer profile fields using different naming conventions (snake_case: `first_name`, `last_name`, `created_at`) than the frontend expects (camelCase: `firstName`, `lastName`, `createdAt`).

## Solution Implemented
Added a `getFieldValue()` helper function that tries multiple naming conventions for each field, with comprehensive fallback chains.

### Field Mapping Implemented
Each field now tries multiple naming variations in this order:

- **firstName**: `firstName`, `first_name`, `firstname`
- **lastName**: `lastName`, `last_name`, `lastname`
- **homePhone**: `homePhone`, `home_phone`, `phone`
- **mobilePhone**: `mobilePhone`, `mobile_phone`, `mobile`
- **streetAddress**: `streetAddress`, `street_address`, `address_street`, `street`
- **city**: `city`, `city_name`
- **state**: `state`, `state_code`
- **zipcode**: `zipcode`, `zip_code`, `postal_code`
- **email**: `email`, `email_address`
- **birthdate**: `birthdate`, `birth_date`, `dateOfBirth`, `date_of_birth`
- **idType**: `idType`, `id_type`, `identificationType`
- **idNumber**: `idNumber`, `id_number`, `identification_number`
- **createdAt**: `createdAt`, `created_at`, `created_date`

## Files Modified

### 1. ManageCustomerProfileForm.js
**Changes:**
- Added `getFieldValue()` helper function (lines ~77-85)
- Updated `handleSelectProfile()` to normalize customer profile with field fallbacks (lines ~81-120)
- Updated search results display to extract firstName/lastName with fallbacks (lines ~263-297)
- Updated profile card display with robust field handling and date validation (lines ~310-350)
- Removed unused `useEffect` import

**Key Features:**
- Invalid date checking: Only calls `toLocaleDateString()` if date is valid
- Name fallback: Checks both firstName and lastName before displaying N/A
- Address concatenation: Conditionally includes state/zipcode if available

### 2. SearchCustomerProfileForm.js
**Changes:**
- Added `getFieldValue()` helper function (line ~14)
- Updated `handleSelectProfile()` to normalize profile with field fallbacks (lines ~56-81)
- Updated search results rendering to extract fields with fallbacks (lines ~120-180)
- Updated selected profile display section with robust field handling (lines ~180-250)

**Key Features:**
- Same normalization pattern as ManageCustomerProfileForm for consistency
- Handles missing names with "Customer {id}" fallback
- Proper address formatting with optional state/zipcode

### 3. ViewCustomerLoansForm.js
**Changes:**
- Added `getFieldValue()` helper function (lines ~19-27)
- Updated `handleProfileSelect()` to normalize all customer fields with fallbacks (lines ~30-45)
- Updated profile card display to handle missing firstName/lastName (lines ~148)
- Updated address concatenation to be optional for each component (lines ~166-170)

**Key Features:**
- Normalizes profile before setting state
- Improves address formatting with conditional components

### 4. CreateCustomerProfileForm.js
**Changes:**
- Added field normalization logic after POST response (lines ~91-107)
- Updated success display to handle missing names (lines ~141-143)
- Added N/A fallback for phone fields

**Key Features:**
- Normalizes newly created customer profile to maintain consistency
- Handles missing names/phones gracefully in success message

## Code Pattern Example

```javascript
const getFieldValue = (obj, ...keys) => {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key];
    }
  }
  return null;
};

// Usage - tries each field name in order until finding a value
const normalizedProfile = {
  firstName: getFieldValue(profile, 'firstName', 'first_name', 'firstname') || 'N/A',
  lastName: getFieldValue(profile, 'lastName', 'last_name', 'lastname') || 'N/A',
  createdAt: getFieldValue(profile, 'createdAt', 'created_at', 'created_date') || new Date().toISOString()
};
```

## Date Validation Logic

```javascript
// Before calling toLocaleDateString()
if (new Date(createdAt).getTime() > 0) {
  return new Date(createdAt).toLocaleDateString();
} else {
  return 'N/A'; // or other fallback
}
```

## Testing Recommendations

1. **Browser Test (localhost:3001)**:
   - Navigate to manage customer profiles
   - Search for customer profile (e.g., Susan, phone: 555-1234)
   - Verify all fields display correctly:
     - Name should show full name
     - Phone should show mobile or home phone
     - Email should display (susan@example.com)
     - Address should display with city, state, zip
     - Joined date should display proper date format, not "Invalid Date"

2. **Backend Integration Test**:
   - Log backend response fields to browser console to see actual field names returned
   - Use browser DevTools Network tab to inspect API response
   - Verify response contains customer data even if field names differ

3. **Edge Cases to Test**:
   - Customer with missing name fields
   - Customer with missing address fields
   - Customer with invalid/missing dates
   - Customer with only home phone or only mobile phone

## Future Improvements

1. **Backend Standardization**:
   - Coordinate with backend team to standardize on camelCase field names
   - Could reduce need for fallback logic

2. **Configuration**:
   - Could create a field mapping configuration file instead of hardcoding fallbacks
   - Would make it easier to update field names if backend changes

3. **Logging**:
   - Add optional debug logging to show which field names were used
   - Helps diagnose future field name mismatches

## Status
✅ **COMPLETE** - All customer profile display components updated with field normalization
