// services/api.js
import { mockUsers, mockRecipients } from './mockData';

export const loginUser = async (email, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = mockUsers.find(
        (u) => u.email === email && u.password === password
      );
      if (user) {
        resolve({ success: true, user });
      } else {
        resolve({ success: false, message: 'Invalid email or password' });
      }
    }, 1000);
  });
};

export const checkUsernameUnique = async (username) => {
  try {
    const exists = mockUsers.some((u) => u.username === username);
    return {
      success: !exists,
      message: exists ? 'Username already exists' : '',
    };
  } catch (error) {
    console.error('Error checking username uniqueness:', error);
    return { success: false, message: 'Failed to check username. Please try again.' };
  }
};

export const checkCnicUnique = async (cnic) => {
  try {
    const exists = mockUsers.some((u) => u.cnic === cnic);
    return {
      success: !exists,
      message: exists ? 'CNIC already registered' : '',
    };
  } catch (error) {
    console.error('Error checking CNIC uniqueness:', error);
    return { success: false, message: 'Failed to check CNIC. Please try again.' };
  }
};

export const checkEmailUniqueAndSendOtp = async (email) => {
  try {
    const exists = mockUsers.some((u) => u.email === email);
    return {
      success: !exists,
      message: exists ? 'Email already registered' : '',
    };
  } catch (error) {
    console.error('Error checking email and sending OTP:', error);
    return { success: false, message: 'Failed to send OTP. Please try again.' };
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    return { success: true, message: '' };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, message: 'Failed to verify OTP. Please try again.' };
  }
};

export const registerUser = async (signupData) => {
  try {
    return { success: true, message: 'Registration successful' };
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, message: 'Failed to register user. Please try again.' };
  }
};

export const sendOtpForPasswordReset = async (email) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = mockUsers.find((u) => u.email === email);
      if (user) {
        resolve({ success: true, message: 'OTP sent successfully' });
      } else {
        resolve({ success: false, message: 'Email not found' });
      }
    }, 1000);
  });
};

export const verifyOtpAndResetPassword = async (email, otp, newPassword) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (otp === '123456') {
        const user = mockUsers.find((u) => u.email === email);
        if (user) {
          user.password = newPassword;
          resolve({ success: true, message: 'Password reset successfully' });
        } else {
          resolve({ success: false, message: 'Email not found' });
        }
      } else {
        resolve({ success: false, message: 'Invalid OTP' });
      }
    }, 1000);
  });
};

export const fetchUserData = async (email) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = mockUsers.find((u) => u.email === email);
      if (user) {
        resolve({ success: true, user });
      } else {
        resolve({ success: false, message: 'User not found' });
      }
    }, 1000);
  });
};

export const fetchRecipients = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, recipients: mockRecipients });
    }, 1000);
  });
};