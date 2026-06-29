import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import RoomItem from './RoomItem';
import Button from '../ui/Button';
import Input from '../ui/Input';

const RoomList = ({ rooms, selectedRoom, onSelectRoom, onCreateRoom }) => {
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const handleCreate = async () => {
    if (newRoomName.trim()) {
      try {
        await onCreateRoom(newRoomName);
        setNewRoomName('');
        setShowCreateInput(false);
      } catch (error) {
        console.error('Error creating room:', error);
      }
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
          onClick={() => setShowCreateInput(true)}
          className="p-2 hover:bg-gray-100 rounded-full text-purple-600 transition-colors"
          title="Create Room"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Create Room Input */}
      {showCreateInput && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="space-y-3">
            <Input
              label="Room Name"
              placeholder="e.g., General Discussion"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancel}
              >
                <X size={16} className="mr-1" />
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreate}
                disabled={!newRoomName.trim()}
              >
                Create Room
              </Button>
            </div>
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