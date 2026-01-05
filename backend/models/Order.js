const mongoose = require('mongoose');

//Define o esquema para os itens do pedido
const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
});

const OrderSchema = new mongoose.Schema({
    orderType: {
    type: String,
    enum: ['dineIn', 'delivery'], // dineIn = Comer no local, delivery = Entrega/Viagem
    default: 'dineIn',
    required: true
  },
  
    tableNumber: {
    type: String, 
    default: '' 
  },

    clientName: { type: String, default: '' },

    waiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },
    items: [OrderItemSchema],
    status: {
        type: String,
        required: true,
        enum: ['pending', 'ready', 'delivered', 'paid' ],
        default: 'pending',
    },

    totalPrice: { type: Number, required: true },

    paymentMethod: { 
    type: String, 
    enum: ['credit', 'debit', 'cash', 'pix', null], 
    default: null 
    },
    amountPaid: { type: Number, default: 0 }, // Quanto o cliente deu (para calcular troco)
    change: { type: Number, default: 0 }, // Troco
    paidAt: { type: Date }

}, { timestamps: true 
});

const Order = mongoose.model('Order', OrderSchema);


module.exports = mongoose.model('Order', OrderSchema);