const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, 
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'hall', 'kitchen', 'client'] },
  imageUrl: { type: String, default: null },

  whatsapp: { type: String, default: '' },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

const User = mongoose.model('User', userSchema);

module.exports = User;