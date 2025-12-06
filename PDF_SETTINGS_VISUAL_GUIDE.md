# PDF Settings Management - Visual Guide

## Admin Panel Layout

### Main Interface
```
┌─────────────────────────────────────────────────────────────┐
│  📄 PDF Settings Management                                  │
│  Customize how PDFs are generated for loans                  │
├─────────────────────────────────────────────────────────────┤
│ [✅] Settings saved successfully!                            │
├─────────────────────────────────────────────────────────────┤
│  🏢 Company Info  📋 Legal Terms  📐 Format & Templates     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Company Information                                         │
│  Configure company details that appear at the top of...    │
│                                                              │
│  Company Name                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ GREEN MOOLAA BRAMPTON                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Address Line 1                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 263 QUEEN ST. E. UNIT 4                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Address Line 2                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ BRAMPTON ON L6W 4K6                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Phone Number                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ (905) 796-7777                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Preview (Top of PDF)                                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         GREEN MOOLAA BRAMPTON                          │ │
│  │         263 QUEEN ST. E. UNIT 4                        │ │
│  │         BRAMPTON ON L6W 4K6                            │ │
│  │         (905) 796-7777                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  [💾 Save Settings]  [⚙️ Reset to Defaults]                │
├─────────────────────────────────────────────────────────────┤
│  ℹ️  How It Works                                            │
│  • Changes made here affect all new PDFs generated         │
│  • All loan PDFs use these settings automatically          │
│  • Previous PDFs won't be affected (only new ones)         │
│  • You can update settings anytime                         │
└─────────────────────────────────────────────────────────────┘
```

## Tab 1: 🏢 Company Info

```
SECTION: Company Information
├── Company Name
│   ├── Input Field: "GREEN MOOLAA BRAMPTON"
│   └── Used in: PDF header, centered
│
├── Address Line 1
│   ├── Input Field: "263 QUEEN ST. E. UNIT 4"
│   └── Used in: PDF second line of address
│
├── Address Line 2
│   ├── Input Field: "BRAMPTON ON L6W 4K6"
│   └── Used in: PDF third line of address
│
├── Phone Number
│   ├── Input Field: "(905) 796-7777"
│   └── Used in: PDF header, contact info
│
└── Live Preview
    ├── Shows exactly how it appears on PDF
    ├── Updates in real-time as you type
    └── Gray background to distinguish from edit area
```

## Tab 2: 📋 Legal Terms

```
SECTION: Legal Terms & Conditions
├── Primary Legal Term (Seller Declaration)
│   ├── Text Area: 6 rows
│   ├── Current: "I, the undersigned (herein 'the seller'), ..."
│   ├── Used in: PDF first legal paragraph
│   └── Help Text: Explains seller's declaration
│
├── Secondary Legal Term (Option Rights)
│   ├── Text Area: 6 rows
│   ├── Current: "Seller is hereby granted a customer option..."
│   ├── Used in: PDF second legal paragraph
│   └── Help Text: Explains buyback/option rights
│
└── Live Preview
    ├── Shows both legal paragraphs
    ├── Shows how they appear on PDF
    ├── Updates as you edit
    └── With separator line between paragraphs
```

## Tab 3: 📐 Format & Templates

```
SECTION: PDF Format & Templates
├── Default Category Name
│   ├── Input Field: "Collateral"
│   ├── Used in: TABLE CATEGORY column
│   └── Help: What to call the item type
│
├── Item Description Template
│   ├── Input Field: "Pawn Loan Agreement"
│   ├── Used in: TABLE DESCRIPTION column
│   └── Help: Default description for all loans
│
├── Minimum Payment Percentage (%)
│   ├── Input Field: "10" (with range 0-100)
│   ├── Calculation: $1000 loan × 10% = $100 minimum
│   ├── Used in: "MINIMUM 30 DAY PAYMENT DUE" line
│   └── Help: Shows as percentage and calculated amount
│
├── Document Reference Code
│   ├── Input Field: "Pawn-GR-02-CAN"
│   ├── Used in: PDF footer (bottom right)
│   └── Help: Internal reference identifier
│
└── Live Preview (Calculations)
    ├── Category Default: "Collateral"
    ├── Item Description: "Pawn Loan Agreement"
    ├── 30-Day Payment on $1000 loan: "$100.00"
    └── Document Code (Footer): "Pawn-GR-02-CAN"
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│           ADMIN PANEL (Web App)                             │
│         PDFSettingsForm.js                                  │
├─────────────────────────────────────────────────────────────┤
│                          ↓                                   │
│  [Admin enters text and clicks "Save Settings"]            │
│                          ↓                                   │
├─────────────────────────────────────────────────────────────┤
│         pdfSettingsService.js                              │
│  (Handles API calls & caching)                             │
├─────────────────────────────────────────────────────────────┤
│                          ↓                                   │
│    POST /admin/pdf-settings                                │
│         (via httpClient)                                    │
│                          ↓                                   │
├─────────────────────────────────────────────────────────────┤
│           BACKEND (server.js)                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  POST /admin/pdf-settings endpoint:                │   │
│  │  1. Verify user is authenticated                   │   │
│  │  2. Verify user is admin/manager                   │   │
│  │  3. Validate input                                 │   │
│  │  4. Get old values for audit                       │   │
│  │  5. UPDATE pdf_settings table                      │   │
│  │  6. INSERT audit log entry                         │   │
│  │  7. Return updated settings                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│            DATABASE                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  pdf_settings table:                               │   │
│  │  ├── company_name                                  │   │
│  │  ├── address1, address2                            │   │
│  │  ├── phone                                         │   │
│  │  ├── legal_term_1, legal_term_2                    │   │
│  │  ├── document_code                                 │   │
│  │  ├── min_payment_percentage                        │   │
│  │  ├── category_default_text                         │   │
│  │  ├── item_description_template                     │   │
│  │  ├── updated_by, updated_at                        │   │
│  │  └── created_at                                    │   │
│  │                                                     │   │
│  │  pdf_settings_audit table:                         │   │
│  │  ├── changed_by (who changed it)                   │   │
│  │  ├── change_summary                                │   │
│  │  ├── old_values (JSONB)                            │   │
│  │  ├── new_values (JSONB)                            │   │
│  │  └── created_at (when it changed)                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

         ⬇️ Settings Cache Loaded (5 min)

┌─────────────────────────────────────────────────────────────┐
│      PDF GENERATION (When User Creates Loan)               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CreateLoanForm.js                                          │
│      ↓                                                       │
│  generateLoanPDFSync(loanData)                             │
│      ↓                                                       │
│  pdfSettingsService.getSettingsSync()                      │
│  (Returns cached settings or defaults)                      │
│      ↓                                                       │
│  Uses settings to build PDF:                               │
│  ├── Header: settings.companyName                          │
│  ├── Address: settings.address1 + settings.address2        │
│  ├── Phone: settings.phone                                 │
│  ├── Category: settings.categoryDefaultText                │
│  ├── Description: settings.itemDescriptionTemplate         │
│  ├── Min Payment: total × settings.minPaymentPercentage    │
│  ├── Footer: settings.documentCode                         │
│  ├── Legal 1: settings.legalTerm1                         │
│  └── Legal 2: settings.legalTerm2                         │
│      ↓                                                       │
│  PDF Generated with Current Settings                        │
│      ↓                                                       │
│  Downloaded to User's Computer                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Example: Changing Legal Terms

### Step-by-Step

1. **Admin opens PDF Settings**
   ```
   URL: http://localhost:3000/admin/pdf-settings
   ```

2. **Clicks "📋 Legal Terms" Tab**
   ```
   Shows textareas with current legal text
   ```

3. **Edits Primary Legal Term**
   ```
   BEFORE: "I, the undersigned (herein 'the seller')..."
   AFTER:  "Updated: I, the party acting as seller..."
   ```

4. **Live Preview Updates**
   ```
   Gray preview box shows new text immediately
   ```

5. **Clicks "Save Settings"**
   ```
   Button shows "Saving..."
   API call made: POST /admin/pdf-settings
   ```

6. **Success Message**
   ```
   "✅ PDF settings saved successfully!"
   Message disappears after 3 seconds
   ```

7. **Next PDF Generated Uses New Terms**
   ```
   User creates loan → PDF downloads → New legal text included
   ```

8. **Audit Log Records Change**
   ```
   Entry created:
   - WHO: username (user_id)
   - WHAT: "PDF settings updated"
   - WHEN: 2025-11-27 14:30:00
   - CHANGES: { old_legalTerm1: "...", new_legalTerm1: "..." }
   ```

## Audit Trail Example

```
GET /admin/pdf-settings/audit-history

Response:
[
  {
    id: 5,
    changed_by: 3,
    username: "admin_john",
    change_summary: "PDF settings updated",
    created_at: "2025-11-27T14:30:00Z"
  },
  {
    id: 4,
    changed_by: 3,
    username: "admin_john",
    change_summary: "PDF settings updated",
    created_at: "2025-11-27T13:15:00Z"
  },
  {
    id: 3,
    changed_by: 2,
    username: "manager_sarah",
    change_summary: "PDF settings updated",
    created_at: "2025-11-26T09:45:00Z"
  }
]
```

## PDF Output Example

### Before Settings Update
```
┌────────────────────────────────────────────┐
│       GREEN MOOLAA BRAMPTON                │
│       263 QUEEN ST. E. UNIT 4              │
│       BRAMPTON ON L6W 4K6                  │
│       (905) 796-7777                       │
├────────────────────────────────────────────┤
│ [ORIGINAL]    Transaction: LT-GRN093813   │
│ John Doe                                   │
│ Cust: 123; 1221 M/T: 30                   │
│ Loan Amount: $1,000.00                     │
│ Due Date: 2025-12-27                       │
├────────────────────────────────────────────┤
│ ITEM │ CATEGORY │ DESCRIPTION │ AMOUNT   │
├──────┼──────────┼─────────────┼──────────┤
│LN-1  │ Collat.  │ Pawn Loan   │ $1,050  │
├────────────────────────────────────────────┤
│ CHARGES DUE ON OR BEFORE        2025-12-27│
│ TOTAL                            $1,050.00│
├────────────────────────────────────────────┤
│ I, the undersigned...                      │
│ (old legal text)                           │
│                                            │
│ Seller is hereby granted...                │
│ (old legal text)                           │
├────────────────────────────────────────────┤
│ MINIMUM 30 DAY PAYMENT DUE        $105.00 │
│ ALL FEES DUE                     $1,050.00│
├────────────────────────────────────────────┤
│                           Pawn-GR-02-CAN  │
└────────────────────────────────────────────┘
```

### After Settings Update
```
┌────────────────────────────────────────────┐
│       NEW COMPANY NAME                     │
│       100 MAIN STREET                      │
│       TORONTO ON M5H 2N2                   │
│       (416) 555-1234                       │
├────────────────────────────────────────────┤
│ [ORIGINAL]    Transaction: LT-NEW123456   │
│ Jane Smith                                 │
│ Cust: 456; 1221 M/T: 30                   │
│ Loan Amount: $1,000.00                     │
│ Due Date: 2025-12-27                       │
├────────────────────────────────────────────┤
│ ITEM │ CATEGORY │ DESCRIPTION │ AMOUNT   │
├──────┼──────────┼─────────────┼──────────┤
│LN-2  │ Item     │ Loan Item   │ $1,050  │
├────────────────────────────────────────────┤
│ CHARGES DUE ON OR BEFORE        2025-12-27│
│ TOTAL                            $1,050.00│
├────────────────────────────────────────────┤
│ Updated: I, the party acting as seller... │
│ (new legal text)                           │
│                                            │
│ Modified: Seller is hereby granted...     │
│ (new legal text)                           │
├────────────────────────────────────────────┤
│ MINIMUM 30 DAY PAYMENT DUE        $210.00 │
│ ALL FEES DUE                     $1,050.00│
├────────────────────────────────────────────┤
│                           CORP-TST-001     │
└────────────────────────────────────────────┘
```

Notice the differences:
- ✅ Company info updated
- ✅ Category text changed (Collateral → Item)
- ✅ Description text changed (Pawn Loan → Loan Item)
- ✅ Minimum payment % updated (10% → 20%)
- ✅ Footer code changed
- ✅ Legal terms updated
