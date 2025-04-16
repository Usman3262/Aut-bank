import { mockUsers, mockRecipients } from './mockData';

export const loginUser = async (email, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      const user = mockUsers.find(
        (u) => u.email === trimmedEmail && u.password === trimmedPassword
      );
      if (user) {
        console.log('api.js: User logged in:', { email: trimmedEmail, userId: user.userId });
        resolve({ success: true, user });
      } else {
        resolve({ success: false, message: 'Invalid email or password' });
      }
    }, 1000);
  });
};

export const checkUsernameUnique = async (username) => {
  try {
    const trimmedUsername = username.trim();
    const exists = mockUsers.some((u) => u.username === trimmedUsername);
    return {
      success: !exists,
      message: exists ? 'Username already exists' : '',
    };
  } catch (error) {
    console.error('api.js checkUsernameUnique error:', error);
    return { success: false, message: 'Failed to check username. Please try again.' };
  }
};

export const checkCnicUnique = async (cnic) => {
  try {
    const trimmedCnic = cnic.trim();
    const exists = mockUsers.some((u) => u.cnic === trimmedCnic);
    return {
      success: !exists,
      message: exists ? 'CNIC already registered' : '',
    };
  } catch (error) {
    console.error('api.js checkCnicUnique error:', error);
    return { success: false, message: 'Failed to check CNIC. Please try again.' };
  }
};

export const checkEmailUniqueAndSendOtp = async (email) => {
  try {
    const trimmedEmail = email.trim();
    const exists = mockUsers.some((u) => u.email === trimmedEmail);
    return {
      success: !exists,
      message: exists ? 'Email already registered' : '',
    };
  } catch (error) {
    console.error('api.js checkEmailUniqueAndSendOtp error:', error);
    return { success: false, message: 'Failed to send OTP. Please try again.' };
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    return { success: true, message: '' };
  } catch (error) {
    console.error('api.js verifyOtp error:', error);
    return { success: false, message: 'Failed to verify OTP. Please try again.' };
  }
};

export const registerUser = async (userData) => {
  try {
    mockUsers.push(userData);
    console.log('api.js: Updated mockUsers:', mockUsers.map(user => ({
      userId: user.userId,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage ? '[Image]' : '[No image]',
    })));
    return { success: true };
  } catch (error) {
    console.error('api.js registerUser error:', error);
    return { success: false, message: 'Registration failed' };
  }
};

export const sendOtpForPasswordReset = async (email) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const trimmedEmail = email.trim();
      const user = mockUsers.find((u) => u.email === trimmedEmail);
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
        const trimmedEmail = email.trim();
        const user = mockUsers.find((u) => u.email === trimmedEmail);
        if (user) {
          user.password = newPassword.trim();
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
      const trimmedEmail = email.trim();
      const user = mockUsers.find((u) => u.email === trimmedEmail);
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