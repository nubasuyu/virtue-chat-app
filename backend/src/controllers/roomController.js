const ChatRoom = require('../models/ChatRoom');

// @desc    Create a new chat room
// @route   POST /api/rooms
// @access  Private
const createRoom = async (req, res) => {
  try {
    const { name, description, type } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please provide a room name' });
    }

    // Create the room and add the creator to the members array
    const room = await ChatRoom.create({
      name,
      description: description || '',
      type: type || 'public',
      members: [req.user._id],
      createdBy: req.user._id,
    });

    // Populate the creator's details before sending back
    const populatedRoom = await ChatRoom.findById(room._id)
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar status');

    res.status(201).json(populatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all rooms for the logged-in user
// @route   GET /api/rooms
// @access  Private
const getRooms = async (req, res) => {
  try {
    // Find all public rooms OR rooms where the user is a member
    const rooms = await ChatRoom.find({
      $or: [
        { type: 'public' },
        { members: req.user._id }
      ]
    })
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar status')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a specific room by ID
// @route   GET /api/rooms/:id
// @access  Private
const getRoomById = async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.id)
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar status');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Optional: Check if user is a member (uncomment if you want strict access control)
    // if (!room.members.some(member => member._id.equals(req.user._id))) {
    //   return res.status(403).json({ message: 'Not authorized to access this room' });
    // }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Join a chat room
// @route   PUT /api/rooms/:id/join
// @access  Private
const joinRoom = async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Use $addToSet to ensure the user isn't added twice
    const updatedRoom = await ChatRoom.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: req.user._id } }, // $addToSet prevents duplicates
      { new: true }
    )
      .populate('members', 'username avatar status');

    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Leave a chat room
// @route   PUT /api/rooms/:id/leave
// @access  Private
const leaveRoom = async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Use $pull to remove the user from the members array
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