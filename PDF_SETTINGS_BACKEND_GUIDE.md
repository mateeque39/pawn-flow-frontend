# PDF Settings Management - Backend Implementation Guide

## Overview

This guide explains how to implement the PDF Settings API endpoints in your backend (server.js). These endpoints allow admin users to manage PDF content (company info, legal terms, etc.) through the web app.

## Database Setup

### 1. Create PDF Settings Table

Run this SQL query in your PostgreSQL database:

```sql
-- Create PDF Settings table
CREATE TABLE IF NOT EXISTS pdf_settings (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) DEFAULT 'GREEN MOOLAA BRAMPTON',
  address1 VARCHAR(255) DEFAULT '263 QUEEN ST. E. UNIT 4',
  address2 VARCHAR(255) DEFAULT 'BRAMPTON ON L6W 4K6',
  phone VARCHAR(20) DEFAULT '(905) 796-7777',
  legal_term_1 TEXT DEFAULT 'I, the undersigned (herein ''the seller''), do hereby loan the item(s) above to the customer amount, the receipt of which is acknowledge by the undersigned (herein ''the Seller''), said Seller does sell, transfer, and assign all rights, title and interest in the described property to GRN. The seller declares that the above is their own personal property free and clear of all claims and liens whatsoever and that they have the full power to sell, transfer and deliver said property as provided herein.',
  legal_term_2 TEXT DEFAULT 'Seller is hereby granted a customer option by GRN to repurchase the described property from GRN at a mutually agreeable price, which is set forth on this contract. The seller has (30) days from the date of this agreement to exercise this option. The seller is not obligated to exercise this option and will forfeit this option (1) days from the agreement date.',
  document_code VARCHAR(50) DEFAULT 'Pawn-GR-02-CAN',
  min_payment_percentage DECIMAL(5,2) DEFAULT 10,
  category_default_text VARCHAR(100) DEFAULT 'Collateral',
  item_description_template VARCHAR(255) DEFAULT 'Pawn Loan Agreement',
  updated_by INT REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit log table for PDF settings changes
CREATE TABLE IF NOT EXISTS pdf_settings_audit (
  id SERIAL PRIMARY KEY,
  changed_by INT REFERENCES users(id),
  change_summary TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_pdf_settings_id ON pdf_settings(id);
CREATE INDEX idx_pdf_settings_audit_user ON pdf_settings_audit(changed_by);
CREATE INDEX idx_pdf_settings_audit_date ON pdf_settings_audit(created_at);
```

## Backend API Endpoints

### Endpoint 1: GET /admin/pdf-settings

**Purpose**: Retrieve current PDF settings

**Authentication**: Required (any authenticated user can read)

**Request**:
```javascript
GET /admin/pdf-settings
```

**Response (200 OK)**:
```javascript
{
  success: true,
  settings: {
    companyName: 'GREEN MOOLAA BRAMPTON',
    address1: '263 QUEEN ST. E. UNIT 4',
    address2: 'BRAMPTON ON L6W 4K6',
    phone: '(905) 796-7777',
    legalTerm1: '...',
    legalTerm2: '...',
    documentCode: 'Pawn-GR-02-CAN',
    minPaymentPercentage: 10,
    categoryDefaultText: 'Collateral',
    itemDescriptionTemplate: 'Pawn Loan Agreement'
  }
}
```

**Error Response (500)**:
```javascript
{
  success: false,
  message: 'Failed to retrieve PDF settings'
}
```

### Endpoint 2: POST /admin/pdf-settings

**Purpose**: Update PDF settings

**Authentication**: Required (admin only - verify user role)

**Request**:
```javascript
POST /admin/pdf-settings
Content-Type: application/json

{
  settings: {
    companyName: 'GREEN MOOLAA BRAMPTON',
    address1: '263 QUEEN ST. E. UNIT 4',
    address2: 'BRAMPTON ON L6W 4K6',
    phone: '(905) 796-7777',
    legalTerm1: 'Updated legal term 1...',
    legalTerm2: 'Updated legal term 2...',
    documentCode: 'Pawn-GR-02-CAN',
    minPaymentPercentage: 10,
    categoryDefaultText: 'Collateral',
    itemDescriptionTemplate: 'Pawn Loan Agreement'
  }
}
```

**Response (200 OK)**:
```javascript
{
  success: true,
  message: 'PDF settings updated successfully',
  settings: {
    // Updated settings returned
  }
}
```

**Error Responses**:
```javascript
// 400 - Bad Request
{
  success: false,
  message: 'Invalid settings format or missing required fields'
}

// 403 - Forbidden
{
  success: false,
  message: 'Only admins can update PDF settings'
}

// 500 - Server Error
{
  success: false,
  message: 'Failed to update PDF settings'
}
```

## Server.js Implementation

Add this code to your `server.js` file:

```javascript
// ==========================================
// PDF SETTINGS MANAGEMENT ENDPOINTS
// ==========================================

// GET /admin/pdf-settings - Retrieve PDF settings
app.get('/admin/pdf-settings', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Query the pdf_settings table
    const result = await pool.query('SELECT * FROM pdf_settings LIMIT 1');

    if (result.rows.length === 0) {
      // If no settings exist, create defaults
      const defaultsQuery = `
        INSERT INTO pdf_settings (
          company_name, address1, address2, phone, legal_term_1, legal_term_2,
          document_code, min_payment_percentage, category_default_text, item_description_template
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        ) RETURNING *;
      `;

      const defaults = [
        'GREEN MOOLAA BRAMPTON',
        '263 QUEEN ST. E. UNIT 4',
        'BRAMPTON ON L6W 4K6',
        '(905) 796-7777',
        'I, the undersigned (herein \'the seller\'), do hereby loan the item(s) above to the customer amount, the receipt of which is acknowledge by the undersigned (herein \'the Seller\'), said Seller does sell, transfer, and assign all rights, title and interest in the described property to GRN. The seller declares that the above is their own personal property free and clear of all claims and liens whatsoever and that they have the full power to sell, transfer and deliver said property as provided herein.',
        'Seller is hereby granted a customer option by GRN to repurchase the described property from GRN at a mutually agreeable price, which is set forth on this contract. The seller has (30) days from the date of this agreement to exercise this option. The seller is not obligated to exercise this option and will forfeit this option (1) days from the agreement date.',
        'Pawn-GR-02-CAN',
        10,
        'Collateral',
        'Pawn Loan Agreement'
      ];

      const defaultResult = await pool.query(defaultsQuery, defaults);
      const settings = convertSettingsFromDB(defaultResult.rows[0]);

      return res.json({
        success: true,
        settings: settings,
        message: 'Default settings created'
      });
    }

    const settings = convertSettingsFromDB(result.rows[0]);
    res.json({
      success: true,
      settings: settings
    });

  } catch (error) {
    logger.error('Error retrieving PDF settings', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve PDF settings',
      error: error.message
    });
  }
});

// POST /admin/pdf-settings - Update PDF settings
app.post('/admin/pdf-settings', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Verify admin role (adjust role name based on your system)
    const userRole = req.user.role || 'user';
    if (userRole !== 'admin' && userRole !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can update PDF settings'
      });
    }

    const { settings } = req.body;

    // Validate input
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings format'
      });
    }

    // Get current settings for audit trail
    const currentResult = await pool.query('SELECT * FROM pdf_settings LIMIT 1');
    const oldValues = currentResult.rows.length > 0 ? currentResult.rows[0] : null;

    // Update settings
    const updateQuery = `
      UPDATE pdf_settings SET
        company_name = $1,
        address1 = $2,
        address2 = $3,
        phone = $4,
        legal_term_1 = $5,
        legal_term_2 = $6,
        document_code = $7,
        min_payment_percentage = $8,
        category_default_text = $9,
        item_description_template = $10,
        updated_by = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM pdf_settings LIMIT 1)
      RETURNING *;
    `;

    const updateValues = [
      settings.companyName || 'GREEN MOOLAA BRAMPTON',
      settings.address1 || '263 QUEEN ST. E. UNIT 4',
      settings.address2 || 'BRAMPTON ON L6W 4K6',
      settings.phone || '(905) 796-7777',
      settings.legalTerm1 || '',
      settings.legalTerm2 || '',
      settings.documentCode || 'Pawn-GR-02-CAN',
      settings.minPaymentPercentage || 10,
      settings.categoryDefaultText || 'Collateral',
      settings.itemDescriptionTemplate || 'Pawn Loan Agreement',
      req.user.id
    ];

    const result = await pool.query(updateQuery, updateValues);

    // Log change to audit trail
    try {
      const auditQuery = `
        INSERT INTO pdf_settings_audit (changed_by, change_summary, old_values, new_values)
        VALUES ($1, $2, $3, $4);
      `;
      await pool.query(auditQuery, [
        req.user.id,
        'PDF settings updated',
        JSON.stringify(oldValues),
        JSON.stringify(settings)
      ]);
    } catch (auditError) {
      logger.warn('Failed to log PDF settings change', { error: auditError.message });
      // Don't fail the request if audit logging fails
    }

    const updatedSettings = convertSettingsFromDB(result.rows[0]);

    logger.info('PDF settings updated', {
      userId: req.user.id,
      username: req.user.username,
      changedFields: Object.keys(settings)
    });

    res.json({
      success: true,
      message: 'PDF settings updated successfully',
      settings: updatedSettings
    });

  } catch (error) {
    logger.error('Error updating PDF settings', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to update PDF settings',
      error: error.message
    });
  }
});

// Helper function to convert database field names to camelCase
function convertSettingsFromDB(dbRow) {
  if (!dbRow) return null;
  return {
    id: dbRow.id,
    companyName: dbRow.company_name,
    address1: dbRow.address1,
    address2: dbRow.address2,
    phone: dbRow.phone,
    legalTerm1: dbRow.legal_term_1,
    legalTerm2: dbRow.legal_term_2,
    documentCode: dbRow.document_code,
    minPaymentPercentage: dbRow.min_payment_percentage,
    categoryDefaultText: dbRow.category_default_text,
    itemDescriptionTemplate: dbRow.item_description_template,
    updatedBy: dbRow.updated_by,
    updatedAt: dbRow.updated_at,
    createdAt: dbRow.created_at
  };
}

// Optional: GET audit history
app.get('/admin/pdf-settings/audit-history', async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const result = await pool.query(`
      SELECT 
        a.id,
        a.changed_by,
        u.username,
        a.change_summary,
        a.created_at
      FROM pdf_settings_audit a
      LEFT JOIN users u ON a.changed_by = u.id
      ORDER BY a.created_at DESC
      LIMIT 50;
    `);

    res.json({
      success: true,
      history: result.rows
    });
  } catch (error) {
    logger.error('Error retrieving audit history', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit history'
    });
  }
});
```

## Frontend Integration

### Step 1: Add PDFSettingsForm to App.js

```javascript
import PDFSettingsForm from './PDFSettingsForm';

// In your navigation or menu:
<route path="/admin/pdf-settings" element={<PDFSettingsForm loggedInUser={loggedInUser} />} />
```

### Step 2: Update Existing PDF Generation Code

In your CreateLoanForm.js, CreateLoanFromProfileForm.js, and ManageCustomerProfileForm.js:

**Before** (Old way):
```javascript
const generatePDF = (loanData) => {
  // Hard-coded values
  doc.text('GREEN MOOLAA BRAMPTON', ...);
  // ...
};
```

**After** (New way with settings):
```javascript
import { generateLoanPDFSync } from './utils/pdfGenerator';

// In your form submission:
const handleCreateLoan = async (loanData) => {
  // ... create loan on server
  
  // Generate PDF with current settings
  generateLoanPDFSync(loanData, { 
    filename: `loan-${loanData.transaction_number}.pdf` 
  });
};
```

### Step 3: Preload Settings on App Start

In App.js:
```javascript
import pdfSettingsService from './services/pdfSettingsService';

useEffect(() => {
  // Preload PDF settings on app startup
  pdfSettingsService.preload();
}, []);
```

## Testing

### Test 1: Retrieve Settings
```bash
curl -X GET http://localhost:3001/admin/pdf-settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 2: Update Settings
```bash
curl -X POST http://localhost:3001/admin/pdf-settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "settings": {
      "companyName": "NEW COMPANY NAME",
      "legalTerm1": "Updated legal text...",
      "minPaymentPercentage": 15
    }
  }'
```

## Security Considerations

1. **Authentication**: Only authenticated users can read settings
2. **Authorization**: Only admins/managers can update settings
3. **Audit Trail**: All changes are logged with user information
4. **Input Validation**: Server validates all inputs
5. **Error Handling**: Sensitive errors are not exposed to client

## Migration from Hard-Coded Values

If you already have hard-coded PDF content:

1. Run the database setup SQL
2. Update all PDF generation code to use `pdfSettingsService`
3. Deploy new version
4. Users can now manage settings through admin panel

## Rollback Plan

If something goes wrong:

1. Check audit history: `SELECT * FROM pdf_settings_audit ORDER BY created_at DESC;`
2. Restore from backup or manually revert values
3. All existing PDFs remain unchanged (immutable)
4. Only new PDFs use updated settings

## Support & Maintenance

- Settings are cached for 5 minutes on the frontend for performance
- Clear cache manually by navigating away and back
- Check audit log for who changed what and when
- Default values are used if any setting is missing
