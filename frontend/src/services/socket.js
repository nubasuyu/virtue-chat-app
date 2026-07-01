import { io } from 'socket.io-client';

// Use environment variable for production, or connect to current host for local dev
const SOCKET_URL = import.meta.env.VITE_API_URL || '';

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export default socket;