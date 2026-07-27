// Validators module - utility functions for loan and customer validation

/**
 * Format loan response from database
 * Converts snake_case database fields to camelCase for frontend compatibility
 * Also includes original snake_case fields for backward compatibility
 */
function formatLoanResponse(loan) {
  if (!loan) return null;

  return {
    // Original snake_case fields (primary - for backend/frontend compatibility)
    id: loan.id,
    first_name: loan.first_name || null,
    last_name: loan.last_name || null,
    email: loan.email || null,
    home_phone: loan.home_phone || null,
    mobile_phone: loan.mobile_phone || null,
    birthdate: loan.birthdate || null,
    id_type: loan.id_type || null,
    id_number: loan.id_number || null,
    referral: loan.referral || null,
    identification_info: loan.identification_info || null,
    street_address: loan.street_address || null,
    city: loan.city || null,
    state: loan.state || null,
    zipcode: loan.zipcode || null,
    customer_number: loan.customer_number || null,
    customer_id: loan.customer_id || null,
    loan_amount: loan.loan_amount,
    interest_rate: loan.interest_rate,
    interest_amount: loan.interest_amount || null,
    total_payable_amount: loan.total_payable_amount,
    item_category: loan.item_category || null,
    item_description: loan.item_description || null,  // KEY: Ensure this is not undefined
    collateral_description: loan.collateral_description || null,
    collateral_category: loan.collateral_category || null,
    customer_note: loan.customer_note || null,
    transaction_number: loan.transaction_number || null,
    loan_issued_date: loan.loan_issued_date || null,
    loan_term: loan.loan_term || null,
    due_date: loan.due_date || null,
    status: loan.status || null,
    remaining_balance: loan.remaining_balance || null,
    created_by: loan.created_by || null,
    created_by_user_id: loan.created_by_user_id || null,
    created_by_username: loan.created_by_username || null,
    customer_name: loan.customer_name || null,
    created_at: loan.created_at || null,
    updated_at: loan.updated_at || null,
    
    // CamelCase versions for frontend compatibility
    firstName: loan.first_name || null,
    lastName: loan.last_name || null,
    homePhone: loan.home_phone || null,
    mobilePhone: loan.mobile_phone || null,
    idType: loan.id_type || null,
    idNumber: loan.id_number || null,
    identificationInfo: loan.identification_info || null,
    streetAddress: loan.street_address || null,
    customerNumber: loan.customer_number || null,
    customerId: loan.customer_id || null,
    loanAmount: loan.loan_amount,
    interestRate: loan.interest_rate,
    interestAmount: loan.interest_amount || null,
    totalPayableAmount: loan.total_payable_amount,
    itemCategory: loan.item_category || null,
    itemDescription: loan.item_description || null,  // KEY: Ensure this is not undefined
    collateralDescription: loan.collateral_description || null,
    collateralCategory: loan.collateral_category || null,
    customerNote: loan.customer_note || null,
    transactionNumber: loan.transaction_number || null,
    loanIssuedDate: loan.loan_issued_date || null,
    loanTerm: loan.loan_term || null,
    dueDate: loan.due_date || null,
    remainingBalance: loan.remaining_balance || null,
    createdBy: loan.created_by || null,
    createdByUserId: loan.created_by_user_id || null,
    createdByUsername: loan.created_by_username || null,
    customerName: loan.customer_name || null,
    createdAt: loan.created_at || null,
    updatedAt: loan.updated_at || null,
    isOverdue: false,
    daysOverdue: 0,
    monthsOverdue: 0,
    overdueCycles: 0,
    statusDisplay: loan.status ? loan.status.toUpperCase() : 'ACTIVE'
  };
}

/**
 * Validate email format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
function validatePhoneNumber(phone) {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\d\-\+\(\)\s]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate loan data
 */
function validateLoanData(loanData) {
  const errors = [];

  if (!loanData.loan_amount || parseFloat(loanData.loan_amount) <= 0) {
    errors.push('Loan amount must be greater than 0');
  }

  if (!loanData.interest_rate || parseFloat(loanData.interest_rate) < 0) {
    errors.push('Interest rate must be 0 or greater');
  }

  if (!loanData.loan_term || parseInt(loanData.loan_term) <= 0) {
    errors.push('Loan term must be greater than 0');
  }

  if (loanData.email && !validateEmail(loanData.email)) {
    errors.push('Invalid email format');
  }

  if (loanData.home_phone && !validatePhoneNumber(loanData.home_phone)) {
    errors.push('Invalid home phone format');
  }

  if (loanData.mobile_phone && !validatePhoneNumber(loanData.mobile_phone)) {
    errors.push('Invalid mobile phone format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate customer data
 */
function validateCustomerData(customerData) {
  const errors = [];

  if (!customerData.first_name || customerData.first_name.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!customerData.last_name || customerData.last_name.trim().length === 0) {
    errors.push('Last name is required');
  }

  if (customerData.email && !validateEmail(customerData.email)) {
    errors.push('Invalid email format');
  }

  if (customerData.home_phone && !validatePhoneNumber(customerData.home_phone)) {
    errors.push('Invalid home phone format');
  }

  if (customerData.mobile_phone && !validatePhoneNumber(customerData.mobile_phone)) {
    errors.push('Invalid mobile phone format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Map request from camelCase (frontend) to snake_case (database)
 * Handles conversion of frontend payload to database field names
 */
function mapRequestToDb(body) {
  return {
    // Loan fields
    loan_amount: body.loanAmount,
    interest_rate: body.interestRate,
    interest_amount: body.interestAmount,
    total_payable_amount: body.totalPayableAmount,
    recurring_fee: body.recurringFee,
    item_category: body.itemCategory,
    item_description: body.itemDescription,
    collateral_description: body.collateralDescription,
    collateral_image: body.collateralImage,
    customer_note: body.customerNote,
    loan_issued_date: body.loanIssuedDate,
    due_date: body.dueDate,
    loan_term: body.loanTerm,
    transaction_number: body.transactionNumber,
    previous_loan_amount: body.previousLoanAmount,
    
    // User fields
    user_id: body.userId,
    created_by_user_id: body.createdByUserId,
    created_by_username: body.createdByUsername,
    
    // Customer fields
    first_name: body.firstName,
    last_name: body.lastName,
    email: body.email,
    home_phone: body.homePhone,
    mobile_phone: body.mobilePhone,
    birthdate: body.birthdate,
    id_type: body.idType,
    id_number: body.idNumber,
    referral: body.referral,
    identification_info: body.identificationInfo,
    street_address: body.streetAddress,
    city: body.city,
    state: body.state,
    zipcode: body.zipcode,
    customer_number: body.customerNumber,
    customer_id: body.customerId,
    
    // Other fields that might be snake_case already
    ...body
  };
}

/**
 * Calculate loan amounts based on principal and rate
 */
function calculateLoanAmounts(loanAmount, interestRate, recurringFee = 0) {
  const principal = parseFloat(loanAmount) || 0;
  const rate = parseFloat(interestRate) || 0;
  const recurring = parseFloat(recurringFee) || 0;
  
  const interestAmount = (principal * rate) / 100;
  const totalPayable = principal + interestAmount + recurring;
  
  return {
    principal,
    interestAmount: parseFloat(interestAmount.toFixed(2)),
    recurringFee: recurring,
    totalPayable: parseFloat(totalPayable.toFixed(2))
  };
}

/**
 * Validate loan amounts
 */
function validateLoanAmounts(loanAmount, interestRate, loanTerm) {
  const amount = parseFloat(loanAmount);
  const rate = parseFloat(interestRate);
  const term = parseInt(loanTerm);

  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Loan amount must be greater than 0' };
  }

  if (isNaN(rate) || rate < 0 || rate > 100) {
    return { valid: false, error: 'Interest rate must be between 0 and 100' };
  }

  if (isNaN(term) || term <= 0) {
    return { valid: false, error: 'Loan term must be greater than 0 days' };
  }

  return { valid: true };
}

module.exports = {
  formatLoanResponse,
  validateEmail,
  validatePhoneNumber,
  validateLoanData,
  validateCustomerData,
  mapRequestToDb,
  calculateLoanAmounts,
  validateLoanAmounts
};
