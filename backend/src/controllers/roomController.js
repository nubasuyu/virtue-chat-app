const ChatRoom = require('../models/ChatRoom');

const createRoom = async (req, res) => {
  try {
    const { name, description, type } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please provide a room name' });
    }

    const room = await ChatRoom.create({
      name,
      description: description || '',
      type: type || 'public',
      members: [req.user._id],
      createdBy: req.user._id,
    });

    const populatedRoom = await ChatRoom.findById(room._id)
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar status');

    res.status(201).json(populatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRooms = async (req, res) => {
  try {
    // Find ALL public rooms (not just rooms user is member of)
    const rooms = await ChatRoom.find({ type: 'public' })
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar status')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.id)
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar status');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const joinRoom = async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const updatedRoom = await ChatRoom.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: req.user._id } },
      { new: true }
    ).populate('members', 'username avatar status');

    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const leaveRoom = async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const updatedRoom = await ChatRoom.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: req.user._id } },
      { new: true }
    );

    res.json({ message: 'Left room successfully', room: updatedRoom });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  joinRoom,
  leaveRoom,
};