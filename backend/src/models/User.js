// backend/src/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://ui-avatars.com/api/?background=8B5CF6&color=fff&name=' },
  status: { type: String, enum: ['online', 'offline', 'away'], default: 'offline' },
}, { timestamps: true });

// Hash password before saving
// ✅ FIX: Removed 'next' from the arguments. In Mongoose 9, async hooks 
// automatically resolve when the function finishes or returns.
userSchema.pre('save', async function() {
  // If the password hasn't been modified, just return early (do nothing)
  if (!this.isModified('password')) return; 
  
  // Otherwise, hash the password
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);