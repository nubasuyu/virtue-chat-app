const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMessages } = require('../controllers/messageController');

const router = express.Router();

// All message routes require authentication
router.use(protect);

router.route('/:roomId').get(getMessages);

module.exports = router;