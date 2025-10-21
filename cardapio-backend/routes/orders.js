const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Rota para criar um novo pedido
router.post('/', async (req, res) => {
    try {
        const { clientName, items, totalPrice } = req.body;
    
        const waiterId = req.user.id; // Obtém o ID do garçom autenticado

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

module.exports = router;