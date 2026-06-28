import { useState } from 'react';
import { Plus } from 'lucide-react';
import RoomItem from './RoomItem';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

const RoomList = ({ rooms, selectedRoom, onSelectRoom, onCreateRoom }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const handleCreate = () => {
    if (newRoomName.trim()) {
      onCreateRoom(newRoomName);
      setNewRoomName('');
      setShowCreateModal(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Rooms</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-2 hover:bg-gray-100 rounded-full text-purple-600 transition-colors"
          title="Create Room"
        >
          <Plus size={20} />
        </button>
      </div>

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

      {/* Create Room Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Room"
      >
        <div className="space-y-4">
          <Input
            label="Room Name"
            placeholder="e.g., General Discussion"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={!newRoomName.trim()}
            >
              Create Room
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RoomList;