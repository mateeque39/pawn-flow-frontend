# Frontend-Backend Endpoint Mapping

## Customer Profile Operations

### Create Customer Profile
**Frontend:** `POST /customers`
**Component:** `CreateCustomerProfileForm.js`
**Payload:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "homePhone": "string",
  "mobilePhone": "string",
  "email": "string",
  "birthdate": "string (YYYY-MM-DD)",
  "referral": "string",
  "idType": "string",
  "idNumber": "string",
  "idDetails": "string",
  "streetAddress": "string",
  "city": "string",
  "state": "string",
  "zipcode": "string",
  "createdByUserId": "string",
  "createdByUsername": "string",
  "createdAt": "string (ISO)"
}
```

### Search Customer Profiles
**Frontend:**
- `GET /customers/search-phone?phone=<phone>`
- `GET /customers/search-name?firstName=<first>&lastName=<last>`
- `GET /customers/{customerId}`

**Component:** `ManageCustomerProfileForm.js` (search section)

---

## Loan Operations (All Scoped to Customer)

### Get All Loans for Customer
**Frontend:** `GET /customers/{customerId}/loans`
**Component:** `ManageCustomerProfileForm.js`

### Create Loan for Customer
**Frontend:** `POST /customers/{customerId}/loans`
**Component:** `ManageCustomerProfileForm.js`
**Payload:**
```json
{
  "loanAmount": "number",
  "interestRate": "number",
  "itemDescription": "string",
  "customerNote": "string",
  "loanTerm": "number (days)",
  "loanIssuedDate": "string (YYYY-MM-DD)",
  "dueDate": "string (YYYY-MM-DD)",
  "createdByUserId": "string",
  "createdByUsername": "string"
}
```

### Make Payment on Loan
**Frontend:** `POST /customers/{customerId}/loans/{loanId}/payment`
**Component:** `ManageCustomerProfileForm.js`
**Payload:**
```json
{
  "paymentAmount": "number",
  "paymentDate": "string (ISO)",
  "processedByUserId": "string",
  "processedByUsername": "string"
}
```

### Extend Loan Due Date
**Frontend:** `POST /customers/{customerId}/loans/{loanId}/extend-due-date`
**Component:** `ManageCustomerProfileForm.js`
**Payload:**
```json
{
  "daysToExtend": "number",
  "newDueDate": "string (YYYY-MM-DD)",
  "extendedByUserId": "string",
  "extendedByUsername": "string"
}
```

### Redeem Loan
**Frontend:** `POST /customers/{customerId}/loans/{loanId}/redeem`
**Component:** `ManageCustomerProfileForm.js`
**Payload:**
```json
{
  "redemptionAmount": "number",
  "redemptionDate": "string (ISO)",
  "redeemedByUserId": "string",
  "redeemedByUsername": "string"
}
```

### Forfeit Loan
**Frontend:** `POST /customers/{customerId}/loans/{loanId}/forfeit`
**Component:** `ManageCustomerProfileForm.js`
**Payload:**
```json
{
  "forfeitedByUserId": "string",
  "forfeitedByUsername": "string",
  "forfeitDate": "string (ISO)"
}
```

### Reactivate Forfeited Loan
**Frontend:** `POST /customers/{customerId}/loans/{loanId}/reactivate`
**Component:** `ManageCustomerProfileForm.js`
**Payload:**
```json
{
  "reactivatedByUserId": "string",
  "reactivatedByUsername": "string",
  "reactivationDate": "string (ISO)"
}
```

---

## Workflow Example

1. **Create Customer**
   ```
   POST /customers → Returns: Customer ID (e.g., 42)
   ```

2. **Create Loan for Customer**
   ```
   POST /customers/42/loans → Returns: Loan ID (e.g., 101)
   ```

3. **View All Loans**
   ```
   GET /customers/42/loans → Returns: [Loan 101, Loan 102, ...]
   ```

4. **Make Payment**
   ```
   POST /customers/42/loans/101/payment
   ```

5. **Extend Due Date**
   ```
   POST /customers/42/loans/102/extend-due-date
   ```

6. **Redeem Loan**
   ```
   POST /customers/42/loans/101/redeem
   ```

---

## Key Points

✅ **All endpoints are customer-scoped** - loans are always accessed through the customer context
✅ **No standalone loan endpoints** - everything is under `/customers/{customerId}/loans`
✅ **Frontend automatically passes** `customerId` and `loggedInUser` info
✅ **PDF generated on loan creation** - automatic document download
✅ **Real-time updates** - loan list refreshes after each operation
