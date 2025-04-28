import api from './api';

// Apply for a loan
export const applyForLoan = async ({ LoanTypeID, LoanAmount, LoanDurationMonths, DueDate }) => {
  try {
    console.log('loanService: Applying for loan', { LoanTypeID, LoanAmount, LoanDurationMonths, DueDate });
    const response = await api.post('/api/v1/users/loans/apply', {
      LoanTypeID,
      LoanAmount,
      LoanDurationMonths,
      DueDate,
    });
    console.log('loanService: Loan application successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('loanService: Error applying for loan:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// List loan types
export const getLoanTypes = async () => {
  try {
    console.log('loanService: Fetching loan types');
    const response = await api.get('/api/v1/users/loans/types');
    console.log('loanService: Loan types fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('loanService: Error fetching loan types:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Record a loan payment
export const recordLoanPayment = async ({ LoanID, PaymentAmount }) => {
  try {
    console.log('loanService: Recording loan payment', { LoanID, PaymentAmount });
    const response = await api.post('/api/v1/users/loans/payments', {
      LoanID,
      PaymentAmount,
    });
    console.log('loanService: Loan payment recorded successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('loanService: Error recording loan payment:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// List user loans
export const getUserLoans = async ({ page = 1, per_page = 10, status, sort_by = 'CreatedAt', order = 'desc' }) => {
  try {
    console.log('loanService: Fetching user loans', { page, per_page, status, sort_by, order });
    const response = await api.get('/api/v1/users/loans', {
      params: { page, per_page, status, sort_by, order },
    });
    console.log('loanService: User loans fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('loanService: Error fetching user loans:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// List loan payments
export const getLoanPayments = async ({ loan_id, page = 1, per_page = 10 }) => {
  try {
    console.log('loanService: Fetching loan payments', { loan_id, page, per_page });
    const response = await api.get(`/api/v1/users/loans/${loan_id}/payments`, {
      params: { page, per_page },
    });
    console.log('loanService: Loan payments fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('loanService: Error fetching loan payments:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};