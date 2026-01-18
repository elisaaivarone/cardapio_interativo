const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Não pode convidar o mesmo email 2x pendente
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['admin', 'hall', 'kitchen'], // Os cargos permitidos
    required: true
  },
  token: {
    type: String,
    required: true // O código secreto do link
  },
  status: {
    type: String,
    enum: ['pending', 'accepted'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '7d' // O convite expira automaticamente em 7 dias se não usado
  }
});

module.exports = mongoose.model('Invite', inviteSchema);