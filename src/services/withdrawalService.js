import api from './api';

export const createWithdrawal = async (withdrawalData) => {
  return api.post('/atm/withdraw', withdrawalData);
};