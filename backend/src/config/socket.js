const { Server } = require('socket.io');
const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: true, // Allow all origins for now
      methods: ['GET', 'POST'],
      credentials: true
    },
    // Critical for Render
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    allowUpgrades: true,
    perMessageDeflate: {
      threshold: 1024
    }
  });

  io.on('connection', (socket) => {
    console.log(`⚡ User connected: ${socket.id}`);

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
    });

    socket.on('send_message', async (data) => {
      try {
        console.log('📩 Received message:', data);
        
        const newMessage = await Message.create({
          content: data.content,
          sender: data.sender._id,
          room: data.roomId,
          type: 'text'
        });

        const populatedMessage = await Message.findById(newMessage._id)
          .populate('sender', 'username avatar');

        await ChatRoom.findByIdAndUpdate(data.roomId, { lastMessage: newMessage._id });

        io.to(data.roomId).emit('receive_message', populatedMessage);
        console.log('✅ Message sent successfully');
      } catch (error) {
        console.error('❌ Error sending message:', error);
      }
    });

    socket.on('typing_start', (data) => {
      socket.to(data.roomId).emit('user_typing', { username: data.username });
    });

    socket.on('typing_stop', (data) => {
      socket.to(data.roomId).emit('user_stop_typing', { username: data.username });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initializeSocket;