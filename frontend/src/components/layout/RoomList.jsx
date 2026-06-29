import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import RoomItem from './RoomItem';

const RoomList = ({ rooms, selectedRoom, onSelectRoom, onCreateRoom }) => {
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const handleCreate = () => {
    if (newRoomName.trim()) {
      onCreateRoom(newRoomName);
      setNewRoomName('');
      setShowCreateInput(false);
    }
  };

  const handleCancel = () => {
    setNewRoomName('');
    setShowCreateInput(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Rooms</h2>
        <button
          onClick={() => setShowCreateInput(!showCreateInput)}
          className="p-2 hover:bg-gray-100 rounded-full text-purple-600 transition-colors"
          title={showCreateInput ? "Close" : "Create Room"}
        >
          {showCreateInput ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {/* Inline Create Room Form */}
      {showCreateInput && (
        <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
          <input
            type="text"
            placeholder="e.g., General Discussion"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!newRoomName.trim()}
              className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Room List */}
      <div className="flex-1 overflow-y-auto py-2">
        {rooms.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 px-4">
            <p>No rooms yet.</p>
            <p className="text-sm">Create one to get started!</p>
          </div>
        ) : (
          rooms.map((room) => (
            <RoomItem
              key={room._id}
              room={room}
              isSelected={selectedRoom?._id === room._id}
              onClick={() => onSelectRoom(room)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RoomList;