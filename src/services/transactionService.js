import api from './api';

const getLastTenTransactions = async () => {
  try {
    console.log('transactionService: Fetching last 10 transactions');
    const response = await api.get('/api/v1/users/transactions', {
      params: {
        page: 1,
        per_page: 30,
        sort_by: 'Timestamp',
        order: 'desc',
      },
    });
    console.log('transactionService: Transactions fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('transactionService: Error fetching transactions:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
  }
};

const exportTransactions = async ({ start_date, end_date, transaction_status, transaction_type } = {}) => {
  try {
    console.log('transactionService: Exporting transactions', { start_date, end_date, transaction_status, transaction_type });
    const response = await api.get('/api/v1/users/transactions/export', {
      params: {
        start_date,
        end_date,
        transaction_status,
        transaction_type,
      },
    });
    console.log('transactionService: Transactions exported:', response.data);
    return response.data;
  } catch (error) {
    console.error('transactionService: Error exporting transactions:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to export transactions');
  }
};

export { getLastTenTransactions, exportTransactions };