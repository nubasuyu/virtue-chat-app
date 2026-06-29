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

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    const handleReceiveMessage = (message) => {
      if (selectedRoom && message.room === selectedRoom._id) {
        setMessages((prev) => [...prev, message]);
      }
      fetchRooms();
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [selectedRoom]);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

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

  const sendMessage = (content) => {
    if (!content.trim() || !selectedRoom) return;

    const messageData = {
      content,
      roomId: selectedRoom._id,
      sender: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
      },
    };

    socket.emit('send_message', messageData);
  };

  const createRoom = async (name) => {
    try {
      await api.post('/rooms', { name, type: 'public' });
      fetchRooms();
    } catch (error) {
      console.error('Error creating room:', error);
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