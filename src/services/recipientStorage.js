import AsyncStorage from '@react-native-async-storage/async-storage';
import {getUserDetails} from './userService'
// Default image path for recipients
const DEFAULT_IMAGE_PATH = 'https://via.placeholder.com/200?text=Default+User';

// Store the current user ID
let currentUserId = null;

// Set the current user's ID
const setUserId = async (userId) => {
  if (!userId) {
    console.error(`recipientStorage: setUserId failed - UserID is missing`);
    throw new Error('UserID is required');
  }
  currentUserId = userId;
  console.log('recipientStorage: Set UserID:', userId);
  return true; // Removed initializeRecipients call to avoid implicit data access
};

// Get user-specific storage key
const getStorageKey = (userId) => {
  if (!userId) {
    console.error(`recipientStorage: getStorageKey failed - UserID is missing`);
    throw new Error('UserID is required');
  }
  return `@recipients:${userId}`;
};

// Initialize local storage for a user (only reads, does not modify)
const initializeRecipients = async (userId) => {
  try {
    console.log(`recipientStorage: Initializing recipients for user ${userId}`);
    const storageKey = getStorageKey(userId);
    const storedRecipients = await AsyncStorage.getItem(storageKey);
    if (storedRecipients) {
      const parsedRecipients = JSON.parse(storedRecipients);
      console.log(`recipientStorage: Found ${parsedRecipients.length} recipients in local storage for user ${userId}`);
      return parsedRecipients;
    }
    console.log(`recipientStorage: No local storage found for user ${userId}, returning empty array`);
    return [];
  } catch (error) {
    console.error(`recipientStorage: Error initializing recipients for user ${userId}: ${error.message}`);
    throw new Error('Failed to initialize recipients');
  }
};

// Save a new recipient to local storage for a user
const saveRecipient = async (userId, recipient) => {
  try {
    console.log(`recipientStorage: Saving recipient for user ${userId}`);
    const storageKey = getStorageKey(userId);
    const storedRecipients = await AsyncStorage.getItem(storageKey);
    const recipients = storedRecipients ? JSON.parse(storedRecipients) : [];

    const maxId = recipients.length > 0 ? Math.max(...recipients.map(r => r.recipientId)) : 0;
    const newRecipient = {
      recipientId: maxId + 1,
      name: recipient.name,
      username: recipient.username,
      ...(recipient.email && { email: recipient.email }),
      ...(recipient.cnic && { cnic: recipient.cnic }),
      image: recipient.image || DEFAULT_IMAGE_PATH,
    };

    const updatedRecipients = [...recipients, newRecipient];
    await AsyncStorage.setItem(storageKey, JSON.stringify(updatedRecipients));

    // Verify save
    const savedData = await AsyncStorage.getItem(storageKey);
    if (!savedData) {
      console.error(`recipientStorage: Verification failed - No data found after saving for user ${userId}`);
      throw new Error('Failed to verify saved data');
    }
    const parsedData = JSON.parse(savedData);
    console.log(`recipientStorage: Saved new recipient for user ${userId}, total ${parsedData.length} recipients`);

    return newRecipient;
  } catch (error) {
    console.error(`recipientStorage: Error saving recipient for user ${userId}: ${error.message}`);
    throw new Error('Failed to save recipient');
  }
};

// Get all recipients from local storage for a user
const getRecipients = async (userId) => {
  try {
    console.log(`recipientStorage: Retrieving recipients for user ${userId}`);
    const storageKey = getStorageKey(userId);
    const storedRecipients = await AsyncStorage.getItem(storageKey);
    if (storedRecipients) {
      const recipients = JSON.parse(storedRecipients);
      console.log(`recipientStorage: Retrieved ${recipients.length} recipients for user ${userId}`);
      return recipients;
    }
    console.log(`recipientStorage: No recipients found for user ${userId}, returning empty array`);
    return [];
  } catch (error) {
    console.error(`recipientStorage: Error retrieving recipients for user ${userId}: ${error.message}`);
    throw new Error('Failed to retrieve recipients');
  }
};

// Delete one or all recipients from local storage for a user
const deleteRecipients = async (userId, recipientId = null) => {
  try {
    console.log(`recipientStorage: Deleting recipients for user ${userId}, recipientId: ${recipientId || 'all'}`);
    const storageKey = getStorageKey(userId);
    const storedRecipients = await AsyncStorage.getItem(storageKey);
    let recipients = storedRecipients ? JSON.parse(storedRecipients) : [];

    if (recipientId) {
      recipients = recipients.filter(r => r.recipientId !== recipientId);
      console.log(`recipientStorage: Deleted recipient ${recipientId} for user ${userId}`);
    } else {
      recipients = [];
      console.log(`recipientStorage: Deleted all recipients for user ${userId}`);
    }

    await AsyncStorage.setItem(storageKey, JSON.stringify(recipients));

    // Verify save
    const savedData = await AsyncStorage.getItem(storageKey);
    const parsedData = savedData ? JSON.parse(savedData) : [];
    console.log(`recipientStorage: Verified ${parsedData.length} recipients remain for user ${userId}`);

    return parsedData;
  } catch (error) {
    console.error(`recipientStorage: Error deleting recipients for user ${userId}: ${error.message}`);
    throw new Error('Failed to delete recipients');
  }
};

// Clear all recipients from local storage for a user (for testing/resetting)
const clearRecipients = async (userId) => {
  try {
    console.log(`recipientStorage: Clearing recipients for user ${userId}`);
    const storageKey = getStorageKey(userId);
    await AsyncStorage.removeItem(storageKey);
    console.log(`recipientStorage: Cleared all recipients for user ${userId}`);

    // Verify clear
    const savedData = await AsyncStorage.getItem(storageKey);
    if (savedData) {
      console.error(`recipientStorage: Verification failed - Data still exists after clearing for user ${userId}`);
      throw new Error('Failed to verify cleared data');
    }
    console.log(`recipientStorage: Verified no recipients remain for user ${userId}`);
    return true;
  } catch (error) {
    console.error(`recipientStorage: Error clearing recipients for user ${userId}: ${error.message}`);
    throw new Error('Failed to clear recipients');
  }
};

// Reset to local storage (for testing)
const resetToLocalStorage = async (userId) => {
  try {
    console.log(`recipientStorage: Resetting to local storage for user ${userId}`);
    const storageKey = getStorageKey(userId);
    const storedRecipients = await AsyncStorage.getItem(storageKey);
    if (storedRecipients) {
      const parsedRecipients = JSON.parse(storedRecipients);
      console.log(`recipientStorage: Reset to local storage for user ${userId} with ${parsedRecipients.length} recipients`);
      return parsedRecipients;
    }
    console.log(`recipientStorage: No local storage found for user ${userId}, returning empty array`);
    return [];
  } catch (error) {
    console.error(`recipientStorage: Error resetting to local storage for user ${userId}: ${error.message}`);
    throw new Error('Failed to reset to local storage');
  }
};

import { mockRecipients } from './RecipientsData';
const saveMockRecipients = async (userId) => {
  console.log(`recipientStorage: Saving mockRecipients for user ${userId}`);
    try {
      if (!userId) {
        console.error(`recipientStorage: saveMockRecipients failed - UserID is missing`);
        throw new Error('UserID is required');
      }
  
      const storageKey = `@recipients:${userId}`;
  
      // Delete existing data
      const existingData = await AsyncStorage.getItem(storageKey);
      if (existingData) {
        console.log(`recipientStorage: Deleting existing data for user ${userId}`);
        await AsyncStorage.removeItem(storageKey);
      }
      
      // Save mockRecipients
      await AsyncStorage.setItem(storageKey, JSON.stringify(mockRecipients));
      console.log(`recipientStorage: Saved ${mockRecipients.length} recipients for user ${userId}`);
      
      // Verify save
      const savedData = await AsyncStorage.getItem(storageKey);
      if (!savedData) {
        console.error(`recipientStorage: Verification failed - No data found after saving for user ${userId}`);
        throw new Error('Failed to verify saved data');
      }
      const parsedData = JSON.parse(savedData);
      console.log(`recipientStorage: Verified saved ${parsedData.length} recipients for user ${userId}`);
  
      return mockRecipients;
    } catch (error) {
      console.error(`recipientStorage: Error in saveMockRecipients: ${error.message}`);
      throw error;
    }
  };
    
  // saveMockRecipients(6)
  export { setUserId, initializeRecipients, saveRecipient, getRecipients, deleteRecipients, clearRecipients, resetToLocalStorage,saveMockRecipients };