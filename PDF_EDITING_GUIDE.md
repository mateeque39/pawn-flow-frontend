# PDF Editing Guide - Where to Edit Values

## 📍 File 1: CreateLoanForm.js (`src/CreateLoanForm.js`)

### Location: Lines 155-200 - DATA EXTRACTION

This is where PDF values are read from the form:

```javascript
// ===== EDIT HERE - Data Extraction Section (Around line 155) =====
const firstName = loanData?.first_name || '';
const lastName = loanData?.last_name || '';
const customerName = loanData?.customer_name || `${firstName} ${lastName}` || 'N/A';
const loanId = loanData?.id || 'N/A';
const transNumber = loanData?.transaction_number || 'N/A';

// Amount fields - backend returns as loan_amount
const loanAmt = parseFloat(loanData?.loan_amount || 0);
const interestAmt = parseFloat(loanData?.interest_amount || 0);
const totalAmt = parseFloat(loanData?.total_payable_amount || 0);

// Date fields
let dueDate = loanData?.due_date || 'N/A';
```

**What each field controls:**
- `firstName`, `lastName` → Customer name on PDF
- `loanId` → Loan ID on PDF
- `transNumber` → Transaction number on PDF
- `loanAmt` → Loan amount displayed
- `dueDate` → Due date displayed

---

### Location: Lines 210-230 - CUSTOMER INFO SECTION

This is the text that shows in the PDF header:

```javascript
// ===== EDIT HERE - Customer Info Section (Around line 210) =====
doc.text(`${firstName} ${lastName}`.trim(), margin, yPosition);
yPosition += 4;
doc.setFontSize(8);
doc.text(`Loan ID: ${loanId}`, margin, yPosition);        // ← Edit here for Loan ID label
yPosition += 4;
doc.text(`Loan Amount: $${loanAmt.toFixed(2)}`, margin, yPosition);  // ← Edit here for amount label
yPosition += 4;
doc.text(`Due Date: ${dueDate}`, margin, yPosition);      // ← Edit here for due date label
yPosition += 6;
```

---

### Location: Lines 250-270 - TABLE CONTENT

This is where the table row displays values:

```javascript
// ===== EDIT HERE - Table Row (Around line 250) =====
const itemNum = 'LN-' + loanId;                    // ← Item number format
const tableCategory = 'Loan';                       // ← Category label
const tableDescription = 'Pawn Loan Agreement';     // ← Description text
const tableAmount = `$${loanAmt.toFixed(2)}`;      // ← Amount in table

doc.text(itemNum, col1Start + 2, yPosition);
doc.text(tableCategory, col2Start + 2, yPosition);
doc.text(tableDescription, col3Start + 2, yPosition);
doc.text(tableAmount, col4Start + 30, yPosition, { align: 'right' });
```

**To change:**
- Item number format: Edit `'LN-' + loanId`
- Category label: Edit `'Loan'`
- Description: Edit `'Pawn Loan Agreement'`

---

### Location: Lines 275-290 - TOTAL & DUE DATE

```javascript
// ===== EDIT HERE - Totals Section (Around line 275) =====
doc.text('CHARGES ON THIS ACCOUNT ARE DUE ON OR BEFORE', margin + colWidths.item + colWidths.category + 5, yPosition);
doc.text(dueDate, pageWidth - margin - 40, yPosition);  // ← Due date shown here
yPosition += 6;

doc.setFont(undefined, 'bold');
doc.setFontSize(9);
doc.text('TOTAL', margin + colWidths.item + colWidths.category + 5, yPosition);  // ← Edit "TOTAL" label
doc.text(`$${loanAmt.toFixed(2)}`, pageWidth - margin - 40, yPosition);          // ← Total amount
```

---

## 📍 File 2: CreateLoanFromProfileForm.js (`src/CreateLoanFromProfileForm.js`)

### Location: Lines 165-195 - DATA EXTRACTION

```javascript
// ===== EDIT HERE - Data Extraction (Around line 165) =====
const custName = loan?.customer_name || `${selectedProfile?.first_name || selectedProfile?.firstName} ${selectedProfile?.last_name || selectedProfile?.lastName}` || 'N/A';
const loanId = loan?.id || 'N/A';
const transNum = loan?.transaction_number || 'N/A';
const loanTerm_val = loan?.loan_term || 'N/A';
const issueDate = loan?.loan_issued_date || new Date().toLocaleDateString();
const amount = parseFloat(loan?.loan_amount || 0);
```

### Location: Lines 205-225 - CUSTOMER INFO DISPLAY

```javascript
// ===== EDIT HERE - Display Customer Info (Around line 205) =====
doc.text(`${custName}`, margin, yPosition);
yPosition += 4;
doc.setFontSize(8);
doc.text(`Cust: ${loanId}; 1221 M/T: ${loanTerm_val}`, margin, yPosition);
yPosition += 4;
doc.text(`Contract Date: ${issueDate}  Date: ${issueDate} Time: ${new Date().toLocaleTimeString()}`, margin, yPosition);
```

### Location: Lines 255-270 - TABLE DATA

```javascript
// ===== EDIT HERE - Table (Around line 255) =====
const collateralDesc_val = collateralDescription || 'Collateral Items';
const itemNum = 'LN-' + loanId;
const tableCategory = 'Collateral';                  // ← Change this text
const descText = doc.splitTextToSize(`${collateralDesc_val}`, colWidths.description - 4);
const tableAmount = `$${amount.toFixed(2)}`;

doc.text(itemNum, col1Start + 2, yPosition);
doc.text(tableCategory, col2Start + 2, yPosition);
doc.text(descText, col3Start + 2, yPosition);
doc.text(tableAmount, col4Start + 30, yPosition, { align: 'right' });
```

---

## 📍 File 3: ManageCustomerProfileForm.js (`src/ManageCustomerProfileForm.js`)

### Location: Lines 535-560 - DATA EXTRACTION

```javascript
// ===== EDIT HERE - Data Extraction (Around line 535) =====
const loanId = loan?.id || 'N/A';
const transNum = loan?.transaction_number || 'N/A';
const amount = parseFloat(loan?.loan_amount || 0);

let formattedDueDate = loan?.due_date || 'N/A';
if (formattedDueDate && formattedDueDate !== 'N/A') {
  try {
    const dateObj = new Date(formattedDueDate);
    formattedDueDate = dateObj.toLocaleDateString();
  } catch (e) {
    // Keep original
  }
}
```

### Location: Lines 570-590 - LOAN INFO DISPLAY

```javascript
// ===== EDIT HERE - Display Loan Info (Around line 570) =====
doc.text(`[CUSTOMER]`, margin, yPosition);
doc.text(`Transaction: ${transNum}`, pageWidth - margin - 40, yPosition);
yPosition += 5;

doc.setFontSize(9);
doc.setFont(undefined, 'normal');
doc.text(`Loan ID: ${loanId}`, margin, yPosition);           // ← Edit label
yPosition += 4;
doc.setFontSize(8);
doc.text(`Loan Amount: $${amount.toFixed(2)}`, margin, yPosition);  // ← Edit label
yPosition += 4;
doc.text(`Due Date: ${formattedDueDate}`, margin, yPosition);       // ← Edit label
```

### Location: Lines 610-625 - TABLE CONTENT

```javascript
// ===== EDIT HERE - Table Row (Around line 610) =====
const itemNum = 'LN-' + loanId;
const tableCategory = 'Loan';                        // ← Edit category
const tableDescription = 'Pawn Loan Agreement';      // ← Edit description
const tableAmount = `$${amount.toFixed(2)}`;

doc.text(itemNum, col1Start + 2, yPosition);
doc.text(tableCategory, col2Start + 2, yPosition);
doc.text(tableDescription, col3Start + 2, yPosition);
doc.text(tableAmount, col4Start + 30, yPosition, { align: 'right' });
```

---

## 🎯 COMMON EDITS

### Change company header information:
**File:** All 3 files (CreateLoanForm.js, CreateLoanFromProfileForm.js, ManageCustomerProfileForm.js)
**Lines:** Around 135-150
```javascript
doc.text('GREEN MOOLAA BRAMPTON', pageWidth / 2, yPosition, { align: 'center' });  // ← Company name
doc.text('263 QUEEN ST. E. UNIT 4', pageWidth / 2, yPosition, { align: 'center' }); // ← Address
doc.text('BRAMPTON ON L6W 4K6', pageWidth / 2, yPosition, { align: 'center' });     // ← City
doc.text('(905) 796-7777', pageWidth / 2, yPosition, { align: 'center' });          // ← Phone
```

### Change legal text at bottom:
**File:** All 3 files
**Lines:** Around 310-330
```javascript
const legalText = doc.splitTextToSize(
  `I, the undersigned (herein 'the seller'), do hereby loan the item(s) above amount...`,  // ← Edit this text
  contentWidth - 4
);
```

### Change table headers:
**File:** All 3 files
**Lines:** Around 230-245
```javascript
doc.text('ITEM', col1Start + 2, tableTop + 5);        // ← Column 1 header
doc.text('CATEGORY', col2Start + 2, tableTop + 5);    // ← Column 2 header
doc.text('DESCRIPTION', col3Start + 2, tableTop + 5); // ← Column 3 header
doc.text('AMOUNT', col4Start + 2, tableTop + 5, { align: 'right' }); // ← Column 4 header
```

---

## ✏️ QUICK EDIT CHECKLIST

- [ ] Company name: Change "GREEN MOOLAA BRAMPTON"
- [ ] Address: Change "263 QUEEN ST. E. UNIT 4"
- [ ] City/Province: Change "BRAMPTON ON L6W 4K6"
- [ ] Phone: Change "(905) 796-7777"
- [ ] Table category (CreateLoanForm): "Loan" → ?
- [ ] Table category (CreateLoanFromProfileForm): "Collateral" → ?
- [ ] Legal terms: Update seller declaration text
- [ ] Document code (footer): Change "Pawn-GR-02-CAN"

---

## 📞 SUPPORT

If you want to change something specific in the PDF:
1. Tell me what you want to change
2. I'll show you the exact line number and code to edit
3. I can make the change for you automatically

Example: "I want the category to say 'Item' instead of 'Loan'" → I can fix it instantly!
