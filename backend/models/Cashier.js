const mongoose = require('mongoose');

const cashierSchema = new mongoose.Schema({
  // Quem abriu o caixa?
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Data de abertura
  openedAt: {
    type: Date,
    default: Date.now,
    required: true
  },

  // Data de fechamento
  closedAt: {
    type: Date,
    default: null
  },

  // Valor inicial (Fundo de Troco)
  initialBalance: {
    type: Number,
    required: true,
    default: 0
  },

  // Valor informado pelo operador ao fechar o caixa
  finalBalanceDeclared: { type: Number },

  // Status
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },

  // Resumo do fechamento
  summary: {
    totalSalesCash: { type: Number, default: 0 },
    totalSalesCard: { type: Number, default: 0 },
    totalSalesPix: { type: Number, default: 0 },
    totalExpenses: { type: Number, default: 0 }, 
    systemBalance: { type: Number, default: 0 }, 
    finalBalanceDeclared: { type: Number, default: 0 },
    difference: { type: Number, default: 0 } 
  }
}, { timestamps: true });

module.exports = mongoose.model('Cashier', cashierSchema);