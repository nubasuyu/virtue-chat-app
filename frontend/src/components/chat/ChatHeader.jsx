import { Users } from 'lucide-react';

const ChatHeader = ({ room }) => {
  if (!room) return null;

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
          <span className="text-purple-600 font-bold text-lg">
            {room.name?.[0]?.toUpperCase()}
          </span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">#{room.name}</h2>
          <div className="flex items-center text-xs text-gray-500">
            <Users size={12} className="mr-1" />
            <span>{room.members?.length || 0} members</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;