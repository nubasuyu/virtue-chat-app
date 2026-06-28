import { io } from 'socket.io-client';

// Use the environment variable if it exists, otherwise fallback to localhost
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL);

export default socket;