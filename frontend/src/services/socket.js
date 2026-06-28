import { io } from 'socket.io-client';

// Connect to the server. 
// Thanks to the Vite proxy in vite.config.js, this automatically routes to localhost:5000
const socket = io();

export default socket;