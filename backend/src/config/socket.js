const { Server } = require('socket.io');
const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');

const initializeSocket = (server) => {
  // Initialize Socket.IO with CORS settings
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5173'], 
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`⚡ User connected: ${socket.id}`);

    // 1. JOIN ROOM
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    // 2. LEAVE ROOM
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.id} left room: ${roomId}`);
    });

    // 3. SEND & SAVE MESSAGE
    socket.on('send_message', async (data) => {
      try {
        // Expected data: { content, sender: { _id, username, avatar }, roomId }
        
        // Save message to database
        const newMessage = await Message.create({
          content: data.content,
          sender: data.sender._id,
          room: data.roomId,
          type: 'text'
        });

        // Populate sender details so the frontend gets the username and avatar
        const populatedMessage = await Message.findById(newMessage._id)
          .populate('sender', 'username avatar');

        // Update the ChatRoom's lastMessage reference
        await ChatRoom.findByIdAndUpdate(data.roomId, { lastMessage: newMessage._id });

        // Broadcast the message to EVERYONE in that specific room
        io.to(data.roomId).emit('receive_message', populatedMessage);
        
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // 4. TYPING INDICATORS
    socket.on('typing_start', (data) => {
      // socket.to() sends to everyone in the room EXCEPT the sender
      socket.to(data.roomId).emit('user_typing', { username: data.username });
    });

    socket.on('typing_stop', (data) => {
      socket.to(data.roomId).emit('user_stop_typing', { username: data.username });
    });

    // 5. DISCONNECT
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initializeSocket;