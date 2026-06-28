const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');

// Import configurations
const connectDB = require('./config/db');
const initializeSocket = require('./config/socket');

// Import routes
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Import error middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express App
const app = express();

// Middleware
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? true : ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});
app.use(express.json());

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO using our dedicated config file
const io = initializeSocket(server);

// Basic Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to The Virtue Chat App API 🚀' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);

// ==========================================
// ERROR HANDLING (MUST BE AFTER ALL ROUTES)
// ==========================================

// 1. Catch 404 errors (requests to routes that don't exist)
app.use(notFound);

// 2. Global error handler (catches all other errors)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 The Virtue Chat App server is running on port ${PORT}`);
});