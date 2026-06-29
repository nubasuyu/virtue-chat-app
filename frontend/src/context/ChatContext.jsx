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

  // Fetch rooms when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Listen for incoming messages
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      if (selectedRoom && message.room === selectedRoom._id) {
        setMessages((prev) => [...prev, message]);
      }
      // Update rooms list to show last message
      fetchRooms();
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [selectedRoom]);

  // Fetch all rooms - prevent duplicates
  const fetchRooms = async () => {
    try {
      console.log('📡 Fetching rooms...');
      const res = await api.get('/rooms');
      console.log('✅ Rooms fetched:', res.data.length, 'rooms');
      
      // Use a Set to eliminate duplicates by room ID
      const uniqueRoomsMap = new Map();
      res.data.forEach(room => {
        uniqueRoomsMap.set(room._id, room);
      });
      
      const uniqueRooms = Array.from(uniqueRoomsMap.values());
      setRooms(uniqueRooms);
    } catch (error) {
      console.error('❌ Error fetching rooms:', error);
    }
  };

  // Select a room
  const selectRoom = async (room) => {
    console.log('📂 Selecting room:', room.name);
    
    // Leave previous room
    if (selectedRoom) {
      socket.emit('leave_room', selectedRoom._id);
    }

    setSelectedRoom(room);
    setMessages([]);

    // Join the new room
    socket.emit('join_room', room._id);
    console.log('🔌 Joined Socket.IO room:', room._id);

    // Fetch message history
    try {
      console.log('📥 Fetching messages for:', room.name);
      const res = await api.get(`/messages/${room._id}`);
      console.log('✅ Fetched', res.data.length, 'messages');
      setMessages(res.data);
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
    }
  };

  // Send a message
  const sendMessage = (content) => {
    if (!content.trim()) {
      console.log('⚠️ Empty message');
      return;
    }
    
    if (!selectedRoom) {
      console.log('⚠️ No room selected');
      return;
    }

    if (!user) {
      console.log('⚠️ No user logged in');
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
      
      // Fetch rooms again to get fresh data (prevents duplicates)
      await fetchRooms();
      
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