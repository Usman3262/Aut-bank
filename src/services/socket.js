import AsyncStorage from '@react-native-async-storage/async-storage';
import { WS_BASE_URL } from '@env';
import api from './api';

const initializeWebSocket = async (accessToken) => {
  const token = accessToken || (await AsyncStorage.getItem('accessToken'));
  if (!token) {
    console.error('socket.js: No access token available');
    return null;
  }

  const wsUrl = `${WS_BASE_URL}/api/v1/ws/user?token=${token}`;
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('socket.js: WebSocket connected');
    ws.send(JSON.stringify({ type: 'ping' }));
  };

  ws.onmessage = (event) => {
    console.log('socket.js: WebSocket message:', event.data);
  };

  ws.onerror = (error) => {
    console.error('socket.js: WebSocket error:', error);
  };

  ws.onclose = async (event) => {
    console.log(`socket.js: WebSocket closed: Code ${event.code}, Reason: ${event.reason}`);
    if (event.code === 4001) {
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const response = await api.post('/api/v1/users/refresh', { refreshToken });
        const newAccessToken = response.data.access_token;
        await AsyncStorage.setItem('accessToken', newAccessToken);
        console.log('socket.js: New Access Token:', newAccessToken);
        return initializeWebSocket(newAccessToken);
      } catch (error) {
        console.error('socket.js: Token refresh failed:', error.response?.data || error.message);
      }
    }
  };

  return ws;
};

export default initializeWebSocket;