const mongoose = require('mongoose');

//Define o esquema para os itens do pedido
const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema({
    clientName: { type: String, required: true },

    // Referência ao garçom que fez o pedido
    waiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referência ao modelo User
        required: true,
    },
    items: [OrderItemSchema],
    status: {
        type: String,
        required: true,
        enum: ['pending', 'ready', 'delivered' ],
        default: 'pending',
    },

    totalPrice: { type: Number, required: true },
}, { timestamps: true // Adiciona campos createdAt e updatedAt automaticamente
});

const Order = mongoose.model('Order', OrderSchema);


module.exports = mongoose.model('Order', OrderSchema);