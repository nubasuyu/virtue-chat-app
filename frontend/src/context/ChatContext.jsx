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
  const { user } = useAuth(); // Get current user to send messages

  // 1. Fetch rooms when the component mounts
  useEffect(() => {
    fetchRooms();
  }, []);

  // 2. Listen for incoming real-time messages
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      // If the message is for the room we are currently looking at, add it to the list
      if (selectedRoom && message.room === selectedRoom._id) {
        setMessages((prev) => [...prev, message]);
      }
      // Refresh the room list to update the "last message" preview in the sidebar
      fetchRooms();
    };

    socket.on('receive_message', handleReceiveMessage);

    // Cleanup listener on unmount
    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [selectedRoom]);

  // Fetch all rooms for the sidebar
  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  // Select a room: Join socket room & fetch history
  const selectRoom = async (room) => {
    // Leave previous room if exists
    if (selectedRoom) {
      socket.emit('leave_room', selectedRoom._id);
    }

    setSelectedRoom(room);
    setMessages([]); // Clear old messages while loading new ones

    // Join the new socket room
    socket.emit('join_room', room._id);

    // Fetch message history from REST API
    try {
      const res = await api.get(`/messages/${room._id}`);
      setMessages(res.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send a message via Socket
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

  // Create a new room
  const createRoom = async (name) => {
    try {
      await api.post('/rooms', { name, type: 'public' });
      fetchRooms(); // Refresh list
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