const express = require('express');
const Item = require('../models/Item');
const router = express.Router();

// ROTAS DE ITENS DO CARDÁPIO
router.get('/', async (req, res) => {
  try {
    // 1. Pedimos ao nosso Model "Item" para encontrar (find) todos os documentos
    const itens = await Item.find();
    // 2. Retornamos os itens encontrados em formato JSON
    res.json(itens);
  } catch (error) {
    // 3.Se der algum erro, enviamos uma mensagem de erro
    res.status(500).json({ message: 'Ocorreu um erro no servidor.' });
  }
});

router.post('/', async (req, res) => {
  try {
   
 // Criamos um novo documento (um novo item) com base no nosso Model "Item"
    const novoItem = new Item(req.body);
        await novoItem.save();
        res.status(201).json(novoItem);
  } catch (error) {
    res.status(400).json({ message: 'Dados inválidos ou incompletos.', error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
   
    // Usamos o método findByIdAndUpdate do Mongoose para atualizar o item
    const updateItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updateItem) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }
    res.json(updateItem);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar o item.', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    
    // Usamos o método "findByIdAndDelete" para encontrar e remover o item
    const deletedItem = await Item.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }

    res.json({ message: 'Item deletado com sucesso!' });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar o item', error: error.message });
  }
});

module.exports = router;