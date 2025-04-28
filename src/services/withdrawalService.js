import api from './api';

export const withdraw = async ({ CardNumber, Pin, Amount }) => {
  try {
    console.log('atmService: Withdrawing funds', { CardNumber, Pin, Amount });
    const response = await api.post('/api/v1/atm/withdraw', { CardNumber, Pin, Amount });
    console.log('atmService: Withdrawal successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('atmService: Error withdrawing funds:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};