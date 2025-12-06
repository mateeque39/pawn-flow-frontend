# Daily Cash Report - Balancing Tab Implementation Guide

## Overview
A new "Balancing Tab" section has been added to the Daily Cash Report that displays critical loan portfolio metrics within a custom date range.

## Features Added

### 1. **Date Range Selector**
- Select custom start and end dates
- Generate report button (disabled until both dates are selected)
- Real-time validation

### 2. **Active Loans Summary**
Displays metrics for loans currently active during the selected period:
- **Total Active Loans**: Number of loans outstanding
- **Total Principal (Active Loans)**: Principal amount the shop will receive
- **Total Interest (Active Loans)**: Interest amount the shop will receive

### 3. **Due Loans Summary**
Displays metrics for loans that are past due during the selected period:
- **Total Due Loans**: Number of loans past their due date
- **Total Principal (Due Loans)**: Principal amount the shop will receive from due loans
- **Total Interest (Due Loans)**: Interest amount the shop will receive from due loans

### 4. **Summary Comparison Table**
A comprehensive table showing side-by-side comparison:
- **Number of Loans**: Active vs Due vs Total
- **Principal Amount**: Active vs Due vs Total
- **Interest Amount**: Active vs Due vs Total
- **Total Shop Gets**: Combined principal + interest for each category

## State Variables Added

```javascript
// Balancing report state
const [balancingData, setBalancingData] = useState(null);
const [balancingLoading, setBalancingLoading] = useState(false);
const [balancingMessage, setBalancingMessage] = useState('');
const [balancingMessageType, setBalancingMessageType] = useState('');
const [balancingStartDate, setBalancingStartDate] = useState('');
const [balancingEndDate, setBalancingEndDate] = useState('');
```

## Backend Endpoint Required

Create a new endpoint on your backend to support this feature:

**Endpoint**: `GET /balancing-report`

**Parameters**:
- `startDate` (string, YYYY-MM-DD format): Start date for the report
- `endDate` (string, YYYY-MM-DD format): End date for the report

**Response Format**:
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "totalActiveLoanCount": 45,
  "totalActivePrincipal": 15000.00,
  "totalActiveInterest": 2250.00,
  "totalDueLoanCount": 8,
  "totalDuePrincipal": 3200.00,
  "totalDueInterest": 480.00
}
```

**Field Descriptions**:
- `totalActiveLoanCount`: Total number of active (non-overdue) loans in the date range
- `totalActivePrincipal`: Sum of principal amounts for active loans
- `totalActiveInterest`: Sum of interest earned on active loans
- `totalDueLoanCount`: Total number of overdue/due loans in the date range
- `totalDuePrincipal`: Sum of principal amounts for due loans
- `totalDueInterest`: Sum of interest earned on due loans

## Visual Design

### Color Scheme
- **Active Loans**: Green (#4caf50, #388e3c, #0288d1) - Healthy state
- **Due Loans**: Orange (#ff9800, #f57c00, #d84315) - Warning state
- **Summary Table**: Blue highlight for the grand total - Emphasis

### Components
- Large metric cards with icons for quick visual scanning
- Responsive grid layout (auto-adjusts on smaller screens)
- Professional color-coded comparison table
- Clear typography hierarchy

## Usage

1. Navigate to the "Daily Cash Report - Balancing Tab" section
2. Select a start date and end date
3. Click the "Generate Balancing Report" button
4. View the metrics across:
   - Active Loans Summary cards
   - Due Loans Summary cards
   - Comparison table with totals

## Error Handling

- **Date Validation**: Both start and end dates must be selected
- **API Error**: Displays helpful message if backend endpoint is not implemented
- **Loading State**: Button shows "Loading..." while fetching data
- **Info Message**: Displays info alert when no data has been fetched yet

## Integration with Existing Features

This new balancing tab integrates seamlessly with existing sections:
- Daily Cash Report (Single Date)
- Revenue Report (Date Range)
- Loan Portfolio Analytics (Date Range)
- **NEW: Balancing Report (Date Range)**

All sections follow the same UI patterns for consistency.

## File Modified
- `src/CashReport.js`

## Notes
- The endpoint should return aggregated data to minimize database queries
- Consider caching results for frequently requested date ranges
- The date range can span any number of days
- Ensure the calculations in the response account for loan status changes within the date range
