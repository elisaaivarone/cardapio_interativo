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

// Rota para obter pedidos com filtro por status    
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};

        if (!['pending', 'ready', 'delivered'].includes(status)) {
            return res.status(400).json({ error: 'Status inválido.' });
    }
    // .populate('waiterId', 'name') substitui o ID do garçom pelo nome dele
    // .sort({ createdAt: 1 }) ordena os pedidos do mais antigo para o mais novo
        filter = { status };
        const orders = await Order.find(filter).populate('waiterId', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        res.status(500).json({ error: 'Erro ao buscar pedidos.', error: error.message });
    }
});

// Rota para atualizar o status de um pedido
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
            { new: true } // Retorna o documento atualizado
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

module.exports = router;