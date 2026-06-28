import { Hash, Users } from 'lucide-react';

const RoomItem = ({ room, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center px-4 py-3 mx-2 rounded-lg cursor-pointer transition-colors mb-1 ${
        isSelected
          ? 'bg-purple-100 text-purple-800'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      <Hash className="mr-3 text-gray-500" size={20} />
      <div className="flex-1 overflow-hidden">
        <h3 className="font-semibold truncate">{room.name}</h3>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Users size={12} className="mr-1" />
          <span>{room.members?.length || 0} members</span>
        </div>
      </div>
    </div>
  );
};

export default RoomItem;