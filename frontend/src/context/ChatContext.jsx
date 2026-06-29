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
  const [isFetching, setIsFetching] = useState(false); // Prevent duplicate fetches
  const { user } = useAuth();

  // Fetch rooms only once when user logs in
  useEffect(() => {
    if (user && rooms.length === 0) {
      fetchRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Listen for messages
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      if (selectedRoom && message.room === selectedRoom._id) {
        setMessages((prev) => [...prev, message]);
      }
      // Only refresh rooms if not already fetching
      if (!isFetching) {
        fetchRooms();
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [selectedRoom, isFetching]);

  // Fetch rooms with duplicate prevention
  const fetchRooms = async () => {
    if (isFetching) return; // Prevent duplicate calls
    
    setIsFetching(true);
    try {
      console.log('📡 Fetching rooms...');
      const res = await api.get('/rooms');
      console.log('✅ Fetched', res.data.length, 'rooms');
      
      // Eliminate duplicates by ID
      const uniqueRoomsMap = new Map();
      res.data.forEach(room => {
        uniqueRoomsMap.set(room._id, room);
      });
      
      setRooms(Array.from(uniqueRoomsMap.values()));
    } catch (error) {
      console.error('❌ Error fetching rooms:', error);
    } finally {
      setIsFetching(false);
    }
  };

  // Select room
  const selectRoom = async (room) => {
    console.log('📂 Selecting room:', room.name);
    
    if (selectedRoom) {
      socket.emit('leave_room', selectedRoom._id);
    }

    setSelectedRoom(room);
    setMessages([]);
    socket.emit('join_room', room._id);

    try {
      const res = await api.get(`/messages/${room._id}`);
      setMessages(res.data);
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
    }
  };

  // Send message
  const sendMessage = (content) => {
    if (!content.trim() || !selectedRoom || !user) return;

    const messageData = {
      content,
      roomId: selectedRoom._id,
      sender: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
      },
    };

    console.log('📤 Sending:', messageData);
    socket.emit('send_message', messageData);
  };

  // Create room
  const createRoom = async (name) => {
    try {
      const res = await api.post('/rooms', { name, type: 'public' });
      await fetchRooms();
      return res.data;
    } catch (error) {
      console.error('❌ Error creating room:', error);
      throw error;
    }
  };

  return (
    <ChatContext.Provider value={{ rooms, selectedRoom, messages, selectRoom, sendMessage, createRoom }}>
      {children}
    </ChatContext.Provider>
  );
};