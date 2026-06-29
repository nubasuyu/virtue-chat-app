import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const { user } = useAuth();

  // Fetch rooms - useCallback to prevent recreating function
  const fetchRooms = useCallback(async () => {
    try {
      const res = await api.get('/rooms');
      // Deduplicate by room ID
      const uniqueRooms = res.data.reduce((acc, room) => {
        if (!acc.find(r => r._id === room._id)) {
          acc.push(room);
        }
        return acc;
      }, []);
      setRooms(uniqueRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  }, []);

  // Initial fetch when user logs in
  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user, fetchRooms]);

  // Socket connection handling
  useEffect(() => {
    const handleConnect = () => {
      console.log('✅ Socket connected');
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      console.log('❌ Socket disconnected');
      setSocketConnected(false);
    };

    const handleReceiveMessage = (message) => {
      if (selectedRoom && message.room === selectedRoom._id) {
        setMessages((prev) => [...prev, message]);
      }
      // Debounce room fetch to prevent duplicates
      setTimeout(() => fetchRooms(), 1000);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [selectedRoom, fetchRooms]);

  // Select room
  const selectRoom = async (room) => {
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
      console.error('Error fetching messages:', error);
    }
  };

  // Send message
  const sendMessage = (content) => {
    if (!content.trim() || !selectedRoom || !user || !socketConnected) {
      console.log('Cannot send:', { hasContent: !!content, hasRoom: !!selectedRoom, hasUser: !!user, connected: socketConnected });
      return;
    }

    socket.emit('send_message', {
      content,
      roomId: selectedRoom._id,
      sender: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
      },
    });
  };

  // Create room
  const createRoom = async (name) => {
    try {
      const res = await api.post('/rooms', { name, type: 'public' });
      setRooms(prev => {
        // Only add if not already exists
        if (prev.find(r => r._id === res.data._id)) return prev;
        return [...prev, res.data];
      });
      return res.data;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };

  return (
    <ChatContext.Provider value={{ 
      rooms, 
      selectedRoom, 
      messages, 
      socketConnected,
      selectRoom, 
      sendMessage, 
      createRoom 
    }}>
      {children}
    </ChatContext.Provider>
  );
};