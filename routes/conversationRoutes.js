const express = require('express');
const router = express.Router();
const { getConversations } = require('../controllers/conversationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getConversations);

module.exports = router;