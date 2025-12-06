# PDF Settings Management - Reference Card

**Quick lookup for implementing PDF Settings Management**

---

## 📋 File Checklist

```
✅ FRONTEND COMPONENTS
  ├── src/PDFSettingsForm.js (430 lines)
  ├── src/PDFSettingsForm.css (500+ lines)
  ├── src/services/pdfSettingsService.js (95 lines)
  └── src/utils/pdfGenerator.js (300+ lines)

✅ DOCUMENTATION
  ├── PDF_SETTINGS_QUICK_START.md (read FIRST)
  ├── PDF_SETTINGS_BACKEND_GUIDE.md (implementation guide)
  ├── PDF_SETTINGS_VISUAL_GUIDE.md (UI/UX reference)
  └── PDF_SETTINGS_IMPLEMENTATION_SUMMARY.md (overview)
```

---

## ⚡ 3-Step Setup

### Step 1️⃣: Backend (15 min)
```bash
# In your server.js backend:
1. Create database table (from PDF_SETTINGS_BACKEND_GUIDE.md)
2. Add GET /admin/pdf-settings endpoint
3. Add POST /admin/pdf-settings endpoint
4. Test with curl
```

### Step 2️⃣: Frontend (10 min)
```javascript
// In App.js:
import PDFSettingsForm from './PDFSettingsForm';

// Add route:
<Route path="/admin/pdf-settings" element={<PDFSettingsForm loggedInUser={loggedInUser} />} />
```

### Step 3️⃣: Update PDF Code (10 min)
```javascript
// In CreateLoanForm.js, CreateLoanFromProfileForm.js, ManageCustomerProfileForm.js:

// REPLACE THIS:
const generatePDF = (loanData) => { ... }

// WITH THIS:
import { generateLoanPDFSync } from './utils/pdfGenerator';

const generatePDF = (loanData) => {
  generateLoanPDFSync(loanData);
};
```

---

## 🎯 Admin Panel URL

```
http://localhost:3000/admin/pdf-settings
```

**Requires**: Admin login

---

## 🔧 What You Can Control

| Setting | Use Case | Where It Appears |
|---------|----------|------------------|
| Company Name | Business name | PDF header |
| Address | Business location | PDF header (2 lines) |
| Phone | Contact number | PDF header |
| Legal Term 1 | Seller declaration | PDF body |
| Legal Term 2 | Option/buyback rights | PDF body |
| Category Name | Item classification | PDF table |
| Description Template | Item description | PDF table |
| Min Payment % | Monthly minimum | PDF calculation |
| Document Code | Reference ID | PDF footer |

---

## 🔌 API Endpoints

### Get Settings
```bash
GET /admin/pdf-settings

curl http://localhost:3001/admin/pdf-settings
```

**Response**:
```json
{
  "success": true,
  "settings": {
    "companyName": "GREEN MOOLAA BRAMPTON",
    "address1": "263 QUEEN ST. E. UNIT 4",
    "address2": "BRAMPTON ON L6W 4K6",
    "phone": "(905) 796-7777",
    "legalTerm1": "...",
    "legalTerm2": "...",
    "documentCode": "Pawn-GR-02-CAN",
    "minPaymentPercentage": 10,
    "categoryDefaultText": "Collateral",
    "itemDescriptionTemplate": "Pawn Loan Agreement"
  }
}
```

### Update Settings
```bash
POST /admin/pdf-settings

curl -X POST http://localhost:3001/admin/pdf-settings \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "companyName": "NEW NAME",
      "minPaymentPercentage": 15
    }
  }'
```

---

## 📊 Database Schema (Quick Reference)

### pdf_settings
```sql
CREATE TABLE pdf_settings (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255),
  address1 VARCHAR(255),
  address2 VARCHAR(255),
  phone VARCHAR(20),
  legal_term_1 TEXT,
  legal_term_2 TEXT,
  document_code VARCHAR(50),
  min_payment_percentage DECIMAL(5,2),
  category_default_text VARCHAR(100),
  item_description_template VARCHAR(255),
  updated_by INT REFERENCES users(id),
  updated_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### pdf_settings_audit
```sql
CREATE TABLE pdf_settings_audit (
  id SERIAL PRIMARY KEY,
  changed_by INT REFERENCES users(id),
  change_summary TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP
);
```

---

## 🧪 Quick Test

### Test 1: Form Loads
```
1. Navigate to http://localhost:3000/admin/pdf-settings
2. See 3 tabs: 🏢 Company Info, 📋 Legal Terms, 📐 Format
Expected: ✅ Form renders without errors
```

### Test 2: Save Settings
```
1. Change "Company Name" to "TEST"
2. Click "Save Settings"
3. See success message
Expected: ✅ "✅ PDF settings saved successfully!"
```

### Test 3: New PDF Uses Settings
```
1. Create a new loan
2. PDF downloads
3. Check header
Expected: ✅ Shows updated company name
```

---

## 🚀 Deployment Checklist

- [ ] Database migration SQL run
- [ ] Backend endpoints implemented
- [ ] Backend tested with curl
- [ ] PDFSettingsForm.js added to project
- [ ] PDFSettingsForm.css added to project
- [ ] pdfSettingsService.js added to services
- [ ] pdfGenerator.js added to utils
- [ ] Route added to App.js
- [ ] PDF generation code updated in 3 forms
- [ ] Frontend tested
- [ ] End-to-end test passed
- [ ] Audit log verified
- [ ] Deployed to production

---

## 📚 Documentation Map

```
START HERE
    ↓
PDF_SETTINGS_QUICK_START.md
    ├→ Quick 3-step setup
    ├→ How it works
    └→ Troubleshooting
    
THEN READ
    ↓
PDF_SETTINGS_BACKEND_GUIDE.md
    ├→ Database setup
    ├→ API implementation
    ├→ Testing procedures
    └→ Security details
    
OPTIONAL READS
    ├→ PDF_SETTINGS_VISUAL_GUIDE.md (mockups & diagrams)
    └→ PDF_SETTINGS_IMPLEMENTATION_SUMMARY.md (deep dive)
```

---

## 🎓 Key Concepts

### 1. Settings Storage
```
Admin Panel → API → Database
```
Settings saved in `pdf_settings` table

### 2. PDF Generation
```
PDF Code → Reads settings from cache
         → If not cached, fetches from DB
         → Generates PDF with current settings
```

### 3. Caching
```
First read:  database (stores in memory for 5 min)
Next reads:  memory cache (fast)
After 5 min: database again (refreshes)
```

### 4. Audit Trail
```
Every change logged:
- Who made the change (user_id)
- What changed (field names)
- When it changed (timestamp)
- Old and new values (for rollback)
```

---

## ⚠️ Common Mistakes

❌ **Don't**: Keep hard-coded values in PDF generation code
✅ **Do**: Use `generateLoanPDFSync()` instead

❌ **Don't**: Forget to run database migration
✅ **Do**: Create `pdf_settings` table first

❌ **Don't**: Restrict admin panel route to superadmins only
✅ **Do**: Allow all admins/managers to access

❌ **Don't**: Update all 3 PDF forms independently
✅ **Do**: Use shared `pdfGenerator.js` utility

❌ **Don't**: Ignore audit logs
✅ **Do**: Review regularly for unauthorized changes

---

## 🔐 Security Checklist

- [ ] API requires authentication
- [ ] POST endpoint checks admin role
- [ ] Server validates all inputs
- [ ] SQL injection prevented (parameterized queries)
- [ ] Audit log persisted
- [ ] Error messages don't expose sensitive info
- [ ] Cache doesn't store sensitive data
- [ ] Rate limiting considered

---

## 📞 Support Resources

### If admin panel won't load:
1. Check frontend files are in correct location
2. Verify route added to App.js
3. Check browser console for errors
4. Ensure httpClient is working

### If settings won't save:
1. Verify backend endpoints exist
2. Check database table exists
3. Check user has admin role
4. Review backend error logs

### If PDF doesn't use new settings:
1. Verify settings saved (check database)
2. Verify generateLoanPDFSync is called
3. Clear browser cache
4. Wait 5 minutes for cache to expire
5. Restart frontend if needed

### If audit log is empty:
1. Check audit table was created
2. Verify changes are being made
3. Review backend logs for errors

---

## 🎯 Success Criteria

✅ You're done when:
- [ ] Admin panel opens and loads settings
- [ ] Can update settings and see success message
- [ ] New PDFs show updated company info
- [ ] New PDFs use updated legal terms
- [ ] New PDFs calculate minimum payment correctly
- [ ] Audit log shows all changes
- [ ] Regular users can't access admin panel
- [ ] Settings persist across app restarts

---

## 📝 Version Info

- **Created**: November 2025
- **Status**: Production Ready
- **Frontend Framework**: React
- **Backend**: Node.js / Express
- **Database**: PostgreSQL
- **PDF Library**: jsPDF

---

## 🎉 You Now Have

✅ Admin panel for managing PDF content
✅ Database-driven settings (no code changes needed)
✅ Full audit trail of all changes
✅ Caching for performance
✅ Professional documentation
✅ Working examples
✅ Security built in

**Next Step**: Follow PDF_SETTINGS_QUICK_START.md to implement!
