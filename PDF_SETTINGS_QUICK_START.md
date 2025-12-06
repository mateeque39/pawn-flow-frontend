# PDF Settings Management - Quick Setup Guide

## What This Enables

With PDF Settings Management, you can now:
- ✅ Change company name, address, phone in PDFs without coding
- ✅ Update legal terms and conditions anytime
- ✅ Modify PDF format (category names, templates, etc.)
- ✅ Control minimum payment percentage calculations
- ✅ Track all changes with audit logs
- ✅ Do it all from the web app admin panel

## Files Created

### Frontend Files:
1. **`PDFSettingsForm.js`** - Admin panel component with 3 tabs
2. **`PDFSettingsForm.css`** - Professional styling
3. **`services/pdfSettingsService.js`** - Settings retrieval & caching service
4. **`utils/pdfGenerator.js`** - PDF generation with dynamic settings

### Documentation Files:
1. **`PDF_SETTINGS_BACKEND_GUIDE.md`** - Complete backend implementation guide

## Quick Start (3 Steps)

### Step 1: Set Up Backend

In your `server.js` (or `pawn-flow` backend):

1. Run the SQL migration from `PDF_SETTINGS_BACKEND_GUIDE.md`:
```sql
CREATE TABLE IF NOT EXISTS pdf_settings (...)
```

2. Copy the backend endpoints from `PDF_SETTINGS_BACKEND_GUIDE.md` into your `server.js`:
- `GET /admin/pdf-settings`
- `POST /admin/pdf-settings`

### Step 2: Integrate Frontend Component

In your `App.js`:

```javascript
import PDFSettingsForm from './PDFSettingsForm';

// Add to your routes/navigation:
<Route path="/admin/pdf-settings" element={<PDFSettingsForm loggedInUser={loggedInUser} />} />
```

### Step 3: Update PDF Generation in Existing Forms

Replace the PDF generation in your form components:

**In CreateLoanForm.js:**
```javascript
// Replace old generatePDF with:
import { generateLoanPDFSync } from './utils/pdfGenerator';

// In your submit handler:
generateLoanPDFSync(loanData);
```

**In CreateLoanFromProfileForm.js:**
```javascript
import { generateLoanPDFSync } from './utils/pdfGenerator';

// In your submit handler:
generateLoanPDFSync(loanData);
```

**In ManageCustomerProfileForm.js:**
```javascript
import { generateLoanPDFSync } from './utils/pdfGenerator';

// In your loan details return handler:
generateLoanPDFSync(loan);
```

## Feature Overview

### 🏢 Company Info Tab
- Company Name
- Address (2 lines)
- Phone Number
- Live preview of header

### 📋 Legal Terms Tab
- Primary legal term (seller declaration)
- Secondary legal term (option rights)
- Live preview of legal section

### 📐 Format & Templates Tab
- Default category name
- Item description template
- Minimum payment percentage
- Document reference code
- Live preview of calculations

## How It Works

1. **Settings Storage**: All settings stored in database table `pdf_settings`
2. **Caching**: Frontend caches settings for 5 minutes (improves performance)
3. **Dynamic PDFs**: All new PDFs use current settings automatically
4. **Audit Trail**: Every change logged with user & timestamp
5. **Fallback**: Default values used if settings unavailable

## Example: Change Legal Terms

**Before** (Had to edit code):
```javascript
// Hard-coded in PDF function
const legalText = "I, the undersigned...";
```

**After** (Use admin panel):
1. Go to `/admin/pdf-settings`
2. Click "📋 Legal Terms" tab
3. Edit the text
4. Click "Save Settings"
5. Next PDF generated uses new text ✅

## Example: Change Company Info

**Before** (Had to edit code in 3 places):
```javascript
// CreateLoanForm.js
doc.text('GREEN MOOLAA BRAMPTON', ...);
// CreateLoanFromProfileForm.js
doc.text('GREEN MOOLAA BRAMPTON', ...);
// ManageCustomerProfileForm.js
doc.text('GREEN MOOLAA BRAMPTON', ...);
```

**After** (One place, one change):
1. Go to `/admin/pdf-settings`
2. Update company name in "🏢 Company Info" tab
3. Save
4. All three forms use new name automatically ✅

## Security

- ✅ Only authenticated users can view settings
- ✅ Only admins/managers can update settings
- ✅ All changes are audited and logged
- ✅ Server-side validation on all inputs
- ✅ No sensitive data exposed in errors

## Testing the Feature

### Test 1: View Settings
```bash
curl http://localhost:3000/admin/pdf-settings
# Should load the admin panel
```

### Test 2: Generate PDF with Default Settings
1. Create a loan as normal
2. PDF downloads with current settings
3. All company info comes from database

### Test 3: Change Settings and Regenerate
1. Go to `/admin/pdf-settings`
2. Change "Company Name" to "TEST COMPANY"
3. Change "Minimum Payment Percentage" to 20
4. Save settings
5. Create another loan
6. Verify new PDF shows:
   - "TEST COMPANY" in header
   - 20% minimum payment (not 10%)

### Test 4: Check Audit Log
```bash
curl http://localhost:3000/admin/pdf-settings/audit-history
# Shows who changed what and when
```

## Deployment Checklist

- [ ] Run database migration SQL
- [ ] Copy backend endpoint code to server.js
- [ ] Add PDFSettingsForm to App.js routes
- [ ] Update PDF generation in all form components
- [ ] Test backend endpoints with curl
- [ ] Test frontend admin panel
- [ ] Generate test PDF and verify
- [ ] Change a setting and verify new PDF uses it
- [ ] Deploy to production

## Troubleshooting

**Issue**: Admin panel shows "Could not load PDF settings"
- **Solution**: Ensure backend endpoints are implemented and database table exists

**Issue**: PDF still shows old text after changing settings
- **Solution**: Settings are cached for 5 minutes. Refresh page or wait 5 minutes.

**Issue**: Only admins can see the admin panel, not regular users
- **Solution**: This is intentional for security. Verify user role is "admin" in database.

**Issue**: Changes saved but new PDFs don't use them
- **Solution**: Ensure PDF generation code uses `generateLoanPDFSync()` not old `generatePDF()`

## Advanced: Using Async PDF Generation

For background/scheduled PDF generation, use the async version:

```javascript
import { generateLoanPDF } from './utils/pdfGenerator';

// In async function:
const result = await generateLoanPDF(loanData, { 
  filename: `loan-${id}.pdf` 
});

if (result.success) {
  console.log('PDF saved:', result.filename);
} else {
  console.error('PDF generation failed:', result.message);
}
```

## What's Next?

After implementation:
1. Users can manage PDF content without code changes
2. Easy to customize for multi-location businesses
3. Audit trail shows compliance & accountability
4. Settings are persisted across restarts
5. Easy to add more customizable fields later

## Need Help?

Refer to:
- `PDF_SETTINGS_BACKEND_GUIDE.md` - Full backend implementation
- `PDFSettingsForm.js` - Frontend component code
- `services/pdfSettingsService.js` - Settings service code
- `utils/pdfGenerator.js` - PDF generation code
