import api from './api';

export const getUserDetails = async () => {
  try {
    const response = await api.get('/api/v1/users/me');
    console.log('UserServices: getUserDetails response:', response.data);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch user details');
  } catch (error) {
    console.error('UserServices: getUserDetails error:', error.response?.data || error.message);
    throw error;
  }
};

export const getUserTransactions = async (params = {}) => {
  try {
    const defaultParams = {
      page: 1,
      per_page: 10,
      sort_by: 'Timestamp',
      order: 'desc',
    };
    const queryParams = { ...defaultParams, ...params };
    console.log('userService: getUserTransactions params:', queryParams);

    const response = await api.get('/api/v1/users/transactions', {
      params: queryParams,
    });
    console.log('userService: getUserTransactions response:', response.data);
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || 'Failed to fetch transactions');
  } catch (error) {
    console.error('userService: getUserTransactions error:', error.response?.data || error.message);
    throw error;
  }
};
export const checkUniqueness = async (field, value) => {
  // Email, CNIC, or Username",
  try {
    const response = await api.post('/api/v1/users/check_uniqueness', { field, value });
    console.log('userService: checkUniqueness response:', response.data);
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || 'Failed to check uniqueness');
  } catch (error) {
    console.error('userService: checkUniqueness error:', error.response?.data || error.message);
    throw error;
  }
};
export const sendVerification = async ({ email, content, type , secret_code }) => {
  try {
    const response = await api.post('/api/v1/users/send_verification', {
      email,
      content,
      type,
      secret_code,
    });

    console.log('userService: sendVerification response:', response.data);

    if (response.data.success) {
      return response.data;
    }

    throw new Error(response.data.message || 'Failed to send verification');
  } catch (error) {
    console.error('userService: sendVerification error:', error.response?.data || error.message);
    throw error;
  }
};


export const registerUser = async (userData) => {
  try {
    const response = await api.post('/api/v1/users/register', userData);
    console.log('userService: registerUser response:', response.data);
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || 'Failed to register user');
  } catch (error) {
    console.error('userService: registerUser error:', error.response?.data || error.message);
    throw error;
  }
};
export const loginUser = async (loginId, password) => {
  return api.post('/users/login', { login_id: loginId, Password: password });
};
export const getUserAnalyticsSummary = async () => {
  try {
    console.log('analyticsService: Fetching user analytics summary');
    const response = await api.get('/api/v1/users/analytics/summary');
    console.log('analyticsService: User analytics summary fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('analyticsService: Error fetching user analytics summary:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
