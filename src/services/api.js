// import axios from "axios";
import { mockUser } from '../../mockData'; // Adjust path if mockData.js is in a different folder

export const loginUser = async (email, password) => {
  // Mock login
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email === mockUser.email && password === mockUser.password) {
        resolve({ success: true, user: mockUser });
      } else {
        resolve({ success: false, message: 'Invalid email or password' });
      }
    }, 1000);
  });
};


// services/api.js

// Function to check if a username is unique
export const checkUsernameUnique = async (username) => {
  try {
    // Replace with actual API call to check username uniqueness
    // Example: const response = await fetch('YOUR_API_ENDPOINT/check-username', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ username }),
    // });
    // const data = await response.json();
    // return { success: !data.exists, message: data.exists ? 'Username already exists' : '' };

    // Placeholder response (replace with actual API call)
    return { success: true, message: '' };
  } catch (error) {
    console.error('Error checking username uniqueness:', error);
    return { success: false, message: 'Failed to check username. Please try again.' };
  }
};

// Function to check if a CNIC is unique
export const checkCnicUnique = async (cnic) => {
  try {
    // Replace with actual API call to check CNIC uniqueness
    // Example: const response = await fetch('YOUR_API_ENDPOINT/check-cnic', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ cnic }),
    // });
    // const data = await response.json();
    // return { success: !data.exists, message: data.exists ? 'CNIC already registered' : '' };

    // Placeholder response (replace with actual API call)
    return { success: true, message: '' };
  } catch (error) {
    console.error('Error checking CNIC uniqueness:', error);
    return { success: false, message: 'Failed to check CNIC. Please try again.' };
  }
};

// Function to check if an email is unique and send OTP
export const checkEmailUniqueAndSendOtp = async (email) => {
  try {
    // Replace with actual API call to check email uniqueness and send OTP
    // Example: const response = await fetch('YOUR_API_ENDPOINT/check-email-and-send-otp', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email }),
    // });
    // const data = await response.json();
    // return { success: !data.exists, message: data.exists ? 'Email already registered' : '' };

    // Placeholder response (replace with actual API call)
    return { success: true, message: '' };
  } catch (error) {
    console.error('Error checking email and sending OTP:', error);
    return { success: false, message: 'Failed to send OTP. Please try again.' };
  }
};

// Function to verify OTP
export const verifyOtp = async (email, otp) => {
  try {
    // Replace with actual API call to verify OTP
    // Example: const response = await fetch('YOUR_API_ENDPOINT/verify-otp', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, otp }),
    // });
    // const data = await response.json();
    // return { success: data.success, message: data.success ? '' : 'Invalid OTP' };

    // Placeholder response (replace with actual API call)
    return { success: true, message: '' };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, message: 'Failed to verify OTP. Please try again.' };
  }
};

// Function to register the user (send all signup data to backend)
export const registerUser = async (signupData) => {
  try {
    // Replace with actual API call to register the user
    // Example: const response = await fetch('YOUR_API_ENDPOINT/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(signupData),
    // });
    // const data = await response.json();
    // return { success: data.success, message: data.message || 'Registration successful' };

    // Placeholder response (replace with actual API call)
    return { success: true, message: 'Registration successful' };
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, message: 'Failed to register user. Please try again.' };
  }
};// services/api.js


// Mock functions for ForgotPasswordScreen (already implemented)
export const sendOtpForPasswordReset = async (email) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email === mockUser.email) {
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
        // Update mockUser password (for testing purposes)
        mockUser.password = newPassword;
        resolve({ success: true, message: 'Password reset successfully' });
      } else {
        resolve({ success: false, message: 'Invalid OTP' });
      }
    }, 1000);
  });
};

// Placeholder for fetching user data (to be updated with sockets later)
export const fetchUserData = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, user: mockUser });
    }, 1000);
  });
};