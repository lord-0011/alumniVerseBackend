const express = require('express');
const router = express.Router();
const { getMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:mentorshipId', protect, getMessages);

module.exports = router;