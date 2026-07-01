const { Server } = require('socket.io');
const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');

const initializeSocket = (server) => {
 /*  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  }); */

  const io = new Server(server, {
  cors: {
    origin: true, // Allows Socket connections from any origin
    methods: ['GET', 'POST'],
    credentials: true
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
      } catch (error) {
        console.error('Error sending message:', error);
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