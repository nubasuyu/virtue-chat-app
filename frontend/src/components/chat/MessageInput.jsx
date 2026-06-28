import { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '../ui/Button';

const MessageInput = ({ onSend, placeholder = 'Type a message...' }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
        />
        <Button
          type="submit"
          variant="primary"
          size="icon"
          disabled={!input.trim()}
          className="rounded-full"
        >
          <Send size={20} />
        </Button>
      </div>
    </form>
  );
};

export default MessageInput;