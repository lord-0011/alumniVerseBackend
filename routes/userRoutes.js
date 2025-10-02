const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
// Add getAlumni to the import
const { updateUserProfile, getUserProfile, getAlumni,getUserById,checkUserStatus,updateProfilePicture } = require('../controllers/userControllers.js'); 
const { protect } = require('../middleware/authMiddleware.js');

// This route handles getting and updating a single user's profile
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

// THIS ROUTE WAS MISSING
router.route('/alumni').get(protect, getAlumni);
router.get('/:id', protect, getUserById);
router.get('/status/:profileUserId', protect, checkUserStatus);
router.put('/profile/picture', protect, upload.single('profilePicture'), updateProfilePicture);

module.exports = router;