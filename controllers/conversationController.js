const Connection = require('../models/Connection');
const MentorshipRequest = require('../models/MentorshipRequest');

// @desc    Get all active conversations for a user
// @route   GET /api/conversations
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Find all accepted alumni-alumni connections
    const connections = await Connection.find({
      status: 'accepted',
      $or: [{ requester: userId }, { recipient: userId }],
    })
    .populate('requester', 'name profilePicture jobTitle')
    .populate('recipient', 'name profilePicture jobTitle');

    // 2. Find all accepted mentorships
    const mentorships = await MentorshipRequest.find({
      status: 'accepted',
      $or: [{ student: userId }, { alumni: userId }],
    })
    .populate('student', 'name profilePicture major')
    .populate('alumni', 'name profilePicture jobTitle');

    // 3. Combine and format the results
    const conversations = [
      ...connections.map(c => ({ ...c.toObject(), type: 'connection' })),
      ...mentorships.map(m => ({ ...m.toObject(), type: 'mentorship' }))
    ];
    
    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getConversations };