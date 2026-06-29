import { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import ChatHeader from './chat/ChatHeader';
import MessageBubble from './chat/MessageBubble';
import MessageInput from './chat/MessageInput';
import { MessageSquare } from 'lucide-react';

const ChatArea = () => {
  const { selectedRoom, messages, sendMessage, socketConnected } = useChat();
  const messagesEndRef = useRef(null);

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
    <div className="flex-1 flex flex-col bg-gray-50 h-full">
      <ChatHeader room={selectedRoom} />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg._id} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput 
        onSend={sendMessage}
        placeholder={socketConnected ? `Message #${selectedRoom.name}...` : 'Connecting...'}
        disabled={!socketConnected}
      />
      
      {!socketConnected && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 text-center text-xs">
          ⚠️ Reconnecting to chat server...
        </div>
      )}
    </div>
  );
};

export default ChatArea;