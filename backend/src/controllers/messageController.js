const Message = require('../models/Message');

// @desc    Get messages for a specific room
// @route   GET /api/messages/:roomId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Fetch messages, populate sender details, sort by newest first, limit to 50
    const messages = await Message.find({ room: roomId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    // Reverse the array so the oldest message is at the top (index 0) for the UI
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMessages };