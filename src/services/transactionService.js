import api from './api';

export const getTransactions = async (params) => {
  return api.get('/users/transactions', { params });
};

export const exportTransactions = async (params) => {
  return api.get('/users/transactions/export', { params, responseType: 'blob' });
};