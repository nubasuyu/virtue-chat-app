const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createRoom,
  getRooms,
  getRoomById,
  joinRoom,
  leaveRoom,
} = require('../controllers/roomController');

const router = express.Router();

// All room routes require the user to be authenticated
router.use(protect); 

router.route('/')
  .post(createRoom)
  .get(getRooms);

router.route('/:id')
  .get(getRoomById);

router.route('/:id/join')
  .put(joinRoom);

router.route('/:id/leave')
  .put(leaveRoom);

module.exports = router;