import { useAuth } from '../../context/AuthContext';
import { formatMessageTime } from '../../utils/formatDate';

const MessageBubble = ({ message }) => {
  const { user } = useAuth();
  const isMe = message.sender?._id === user._id;

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-md px-4 py-2 rounded-2xl shadow-sm ${
          isMe
            ? 'bg-purple-600 text-white rounded-br-none'
            : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
        }`}
      >
        {!isMe && (
          <p className="text-xs font-bold text-purple-600 mb-1">
            {message.sender?.username}
          </p>
        )}
        <p className="text-sm">{message.content}</p>
        <p
          className={`text-[10px] mt-1 ${
            isMe ? 'text-purple-200 text-right' : 'text-gray-400'
          }`}
        >
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;