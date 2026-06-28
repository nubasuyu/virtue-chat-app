import { useChat } from '../context/ChatContext';
import RoomList from './layout/RoomList';

const Sidebar = () => {
  const { rooms, selectedRoom, selectRoom, createRoom } = useChat();

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <RoomList
        rooms={rooms}
        selectedRoom={selectedRoom}
        onSelectRoom={selectRoom}
        onCreateRoom={createRoom}
      />
    </div>
  );
};

export default Sidebar;