import { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import ChatHeader from './chat/ChatHeader';
import MessageBubble from './chat/MessageBubble';
import MessageInput from './chat/MessageInput';
import { MessageSquare } from 'lucide-react';

const ChatArea = () => {
  const { selectedRoom, messages, sendMessage } = useChat();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!selectedRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500">
        <div className="text-center">
          <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold">Select a room to start chatting</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <ChatHeader room={selectedRoom} />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput 
        onSend={sendMessage}
        placeholder={`Message #${selectedRoom.name}...`}
      />
    </div>
  );
};

export default ChatArea;