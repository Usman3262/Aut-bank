// cloudinaryService.js

import axios from 'axios';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_FOLDER } from '@env';

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const CLOUDINARY_IMAGE_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Upload image using unsigned preset
 * @param {string} imageUri - Local image URI
 * @param {string} publicId - Path like "user_profile/username" or "recipients/username/recipient"
 * @returns {Promise<string>} - Secure image URL
 */
const uploadImage = async (imageUri, publicId) => {
  const fullPublicId = `${CLOUDINARY_FOLDER}/${publicId}`;

  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: `${publicId}.jpg`,  // Appending the extension for the upload process
    type: 'image/jpeg',
  });
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('public_id', fullPublicId);

  const res = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data.secure_url;
};

// ========== Upload Handlers ==========

export const uploadUserProfileImage = async (imageUri, username) => {
  // Use only username for public_id (no timestamp)
  const publicId = `user_profile/${username}`;
  return await uploadImage(imageUri, publicId);
};

export const uploadRecipientImage = async (imageUri, username, recipientName) => {
  // Use only recipientName for public_id (no timestamp)
  const publicId = `recipients/${username}/${recipientName}`;
  return await uploadImage(imageUri, publicId);
};

// ========== Get Image URL ==========

export const getUserProfileImageUrl = (username) => {
  return `${CLOUDINARY_IMAGE_BASE_URL}/${CLOUDINARY_FOLDER}/user_profile/${username}.jpg`;
};

export const getRecipientImageUrl = (username, recipientName) => {
  return `${CLOUDINARY_IMAGE_BASE_URL}/${CLOUDINARY_FOLDER}/recipients/${username}/${recipientName}.jpg`;
};

export const getAllRecipientImages = (username, recipientNames) => {
  return recipientNames.map((name) => ({
    name,
    imageUrl: getRecipientImageUrl(username, name),
  }));
};
