const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const initializeSocket = require('./config/socket');

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const messageRoutes = require('./routes/messageRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

/* app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
 */

app.use(cors({
  origin: true, // Allows requests from any origin (Frontend)
  credentials: true
}));

app.use(express.json());

const server = http.createServer(app);
const io = initializeSocket(server);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to The Virtue Chat App API 🚀' });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 The Virtue Chat App server is running on port ${PORT}`);
});