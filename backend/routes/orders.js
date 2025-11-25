const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Rota para criar um novo pedido (POST /api/orders)
router.post('/', async (req, res) => {
    try {
        const { clientName, items, totalPrice } = req.body;
    
        const waiterId = req.user.id; 

        if (!clientName || !items || items.length === 0 || !totalPrice) {   
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }
        const newOrder = new Order({
            clientName,
            waiterId,
            items,
            totalPrice,
        });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        res.status(500).json({ error: 'Erro ao criar pedido.', error: error.message });
    }
});

// Rota para obter pedidos com filtro por status (GET /api/orders?status=)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {}; 

    if (status) {
      // Se tiver vírgula (ex: "ready,delivered"), usa o operador $in
      if (status.includes(',')) {
        filter = { status: { $in: status.split(',') } };
      } else {
        // Comportamento para um único status (ex: "pending")
        if (!['pending', 'ready', 'delivered', 'paid'].includes(status)) {
          return res.status(400).json({ message: 'Status inválido.' });
        }
        filter = { status };
      }
    }
    
    const orders = await Order.find(filter)
      .populate('waiterId', 'name') //substitui o ID do garçom pelo nome dele
      .sort({ createdAt: 1 });    // Ordena por data de criação (mais antigo primeiro)

    res.json(orders);

  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({ message: 'Erro no servidor.', error: error.message });
  }
});

// Rota para atualizar o status de um pedido (PATCH /api/orders/:id)
router.patch('/:id/', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;    

        if (!status || !['pending', 'ready', 'delivered'].includes(status)) {
            return res.status(400).json({ error: 'Status inválido.' });
        }
        const updatedOrder = await Order.findByIdAndUpdate(
            id, 
            { status },
            { new: true } 
        ).populate('waiterId', 'name email');

        if(!updatedOrder) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }
        res.json(updatedOrder);

    } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
        res.status(500).json({ error: 'Erro ao atualizar pedido.', error: error.message });
    }
});

//ROTA PARA PAGAR O PEDIDO (PATCH /api/orders/:id/pay)
router.patch('/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, amountPaid } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }

    // Lógica simples de troco
    let change = 0;
    if (paymentMethod === 'cash' && amountPaid) {
      change = amountPaid - order.totalPrice;
      if (change < 0) {
          return res.status(400).json({ message: 'Valor pago é menor que o total.' });
      }
    }

    order.status = 'paid';
    order.paymentMethod = paymentMethod;
    order.amountPaid = amountPaid || order.totalPrice;
    order.change = change;
    order.paidAt = new Date();

    await order.save();
    res.json(order);

  } catch (error) {
    console.error("Erro ao processar pagamento:", error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

module.exports = router;