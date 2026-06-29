import { io } from 'socket.io-client';

// Get the backend URL from environment variable
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

console.log('🔌 Attempting to connect to:', BACKEND_URL);

const socket = io(BACKEND_URL, {
  transports: ['polling', 'websocket'], // Try polling first, then websocket
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true,
  forceNew: true
});

// Debug all connection events
socket.on('connect', () => {
  console.log('✅ Socket connected successfully! ID:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error.message);
  console.error('Error type:', error.type);
  console.error('Error description:', error.description);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket disconnected. Reason:', reason);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_error', (error) => {
  console.error('🔄 Reconnection error:', error.message);
});

export default socket;