import { io } from 'socket.io-client';
import { SOCKET_URL } from '@env';

let socket = null;

// Initialize WebSocket connection
export const initializeSocket = (token) => {
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.log('Socket connection error:', error.message);
  });

  return socket;
};

// Subscribe to notifications
export const subscribeToNotifications = (callback) => {
  if (socket) {
    socket.on('notification', callback);
  }
};

// Unsubscribe from notifications
export const unsubscribeFromNotifications = () => {
  if (socket) {
    socket.off('notification');
  }
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};