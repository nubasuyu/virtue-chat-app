import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const { user } = useAuth();

  // Fetch rooms when component mounts
  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  // Listen for incoming messages
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      if (selectedRoom && message.room === selectedRoom._id) {
        setMessages((prev) => [...prev, message]);
      }
      // Always refresh rooms to update last message
      fetchRooms();
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [selectedRoom]);

  // Fetch all rooms
  const fetchRooms = async () => {
    try {
      console.log('📡 Fetching rooms...');
      const res = await api.get('/rooms');
      console.log('✅ Rooms fetched:', res.data);
      setRooms(res.data);
    } catch (error) {
      console.error('❌ Error fetching rooms:', error);
    }
  };

  // Select a room
  const selectRoom = async (room) => {
    console.log('📂 Selecting room:', room);
    
    // Leave previous room
    if (selectedRoom) {
      socket.emit('leave_room', selectedRoom._id);
    }

    setSelectedRoom(room);
    setMessages([]);

    // Join the new room
    socket.emit('join_room', room._id);
    console.log('🔌 Joined room:', room._id);

    // Fetch message history
    try {
      console.log('📥 Fetching messages for room:', room._id);
      const res = await api.get(`/messages/${room._id}`);
      console.log('✅ Messages fetched:', res.data.length);
      setMessages(res.data);
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
    }
  };

  // Send a message
  const sendMessage = (content) => {
    if (!content.trim() || !selectedRoom) {
      console.log('⚠️ Cannot send message:', { content, selectedRoom });
      return;
    }

    const messageData = {
      content,
      roomId: selectedRoom._id,
      sender: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
      },
    };

    console.log('📤 Sending message:', messageData);
    socket.emit('send_message', messageData);
  };

  // Create a new room
  const createRoom = async (name) => {
    try {
      console.log('🏗️ Creating room:', name);
      const res = await api.post('/rooms', { name, type: 'public' });
      console.log('✅ Room created:', res.data);
      
      // Add the new room to the list immediately
      setRooms((prev) => [...prev, res.data]);
      
      return res.data;
    } catch (error) {
      console.error('❌ Error creating room:', error);
      throw error;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        rooms,
        selectedRoom,
        messages,
        selectRoom,
        sendMessage,
        createRoom,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};