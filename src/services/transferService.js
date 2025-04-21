import api from './api';
const createTransfer = async (identifier, amount, description) => {
    try {
      const requestBody = {
        ...(identifier.email && { email: identifier.email }),
        ...(identifier.cnic && { cnic: identifier.cnic }),
        ...(identifier.username && { username: identifier.username }),
        Amount: amount,
        Description: description,
      };
      console.log('transferService: Transfer request body:', requestBody);
      const response = await api.post('/api/v1/users/transfer', requestBody);
      console.log('transferService: Transfer successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('transferService: Error creating transfer:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create transfer');
    }
  };
  
  export { createTransfer };