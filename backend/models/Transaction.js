const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  cashierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cashier',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['supply', 'bleed'], // supply = Suprimento (Entrada), bleed = Sangria (Saída)
    required: true
  },
  category: {
    type: String, // "Retirada", "Troco"
    required: true
  },
  description: String, // Ex: "Retirada para cofre" ou "Adicional de troco"
  value: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);