const User = require('../models/User.js');
const Connection = require('../models/Connection');
const MentorshipRequest = require('../models/MentorshipRequest');

/**
 * @desc    Get all alumni
 * @route   GET /api/users/alumni
 * @access  Public
 */
const getAlumni = async (req, res) => {
  try {
    const alumni = await User.find({ role: 'alumni' }).select('-password');
    res.json(alumni);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Get logged-in user's profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  const user = req.user; // attached via protect middleware
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

/**
 * @desc    Update logged-in user's profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.collegeName = req.body.collegeName || user.collegeName;

    if (user.role === 'alumni') {
      user.graduationYear = req.body.graduationYear || user.graduationYear;
      user.currentCompany = req.body.currentCompany || user.currentCompany;
      user.jobTitle = req.body.jobTitle || user.jobTitle;
    } else {
      user.expectedGraduationYear = req.body.expectedGraduationYear || user.expectedGraduationYear;
      user.major = req.body.major || user.major;
      user.careerGoals = req.body.careerGoals || user.careerGoals;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Update profile picture
 * @route   PUT /api/users/profile-picture
 * @access  Private
 */
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // req.file.path should contain the Cloudinary or local file URL
    user.profilePicture = req.file.path;
    await user.save();

    res.json({
      message: 'Profile picture updated successfully.',
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Check relationship status between logged-in user and another profile
 * @route   GET /api/users/status/:profileUserId
 * @access  Private
 */
const checkUserStatus = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const profileUserId = req.params.profileUserId;
    const loggedInUserRole = req.user.role;

    let relationship = { status: 'none' };

    if (loggedInUserRole === 'alumni') {
      // Check alumni-alumni connection
      const connection = await Connection.findOne({
        $or: [
          { requester: loggedInUserId, recipient: profileUserId },
          { requester: profileUserId, recipient: loggedInUserId },
        ],
      });
      if (connection) {
        relationship = {
          status: connection.status,
          id: connection._id,
          type: 'connection',
        };
      }
    } else if (loggedInUserRole === 'student') {
      // Check student-alumni mentorship
      const mentorship = await MentorshipRequest.findOne({
        student: loggedInUserId,
        alumni: profileUserId,
      });
      if (mentorship) {
        relationship = {
          status: mentorship.status,
          id: mentorship._id,
          type: 'mentorship',
        };
      }
    }

    res.json(relationship);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { 
  getAlumni,
  getUserProfile,
  updateUserProfile,
  getUserById,
  updateProfilePicture,
  checkUserStatus
};
