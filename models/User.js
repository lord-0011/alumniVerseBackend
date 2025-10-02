const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // --- Basic Information ---
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['student', 'alumni'], 
    required: true 
  },
  collegeName: { 
    type: String 
  },

  // --- Profile ---
  profilePicture: { 
    type: String, 
    default: '' // store a URL/path if uploaded
  },

  // --- Points System ---
  points: { 
    type: Number, 
    default: 0 
  },

  // --- Alumni-specific Fields ---
  graduationYear: { 
    type: Number 
  },
  currentCompany: { 
    type: String 
  },
  jobTitle: { 
    type: String 
  },

  // --- Student-specific Fields ---
  expectedGraduationYear: { 
    type: Number 
  },
  major: { 
    type: String 
  },
  careerGoals: { 
    type: String 
  },
}, { 
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// --- Middleware & Methods ---

// Hash password before saving the user
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with the hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
