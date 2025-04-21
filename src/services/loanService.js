import api from './api';

export const applyForLoan = async (loanData) => {
  return api.post('/users/loans/apply', loanData);
};

export const getLoanTypes = async () => {
  return api.get('/users/loans/types');
};

export const makeLoanPayment = async (paymentData) => {
  return api.post('/users/loans/payments', paymentData);
};

export const getLoans = async (params) => {
  return api.get('/users/loans', { params });
};

export const getLoanPayments = async (loanId, params) => {
  return api.get(`/users/loans/${loanId}/payments`, { params });
};