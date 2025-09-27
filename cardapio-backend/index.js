const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const Item = require('./models/Item');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('✅ Conectado ao MongoDB Atlas'))
  .catch((error) => console.log('❌ Erro ao conectar ao MongoDB Atlas:', error));

// ROTAS DE AUTENTICAÇÃO
app.use('/api/auth', authRoutes);

// ROTAS DE ITENS DO CARDÁPIO
app.get('/itens', async (req, res) => {
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

app.post('/itens', async (req, res) => {
  try {
    // 1. Pegamos os dados que foram enviados no corpo (body) da requisição
    const { name, description, price, imageUrl, category } = req.body;

    // 2. Criamos um novo documento (um novo item) com base no nosso Model "Item"
    const novoItem = new Item({
      name,
      description,
      price,
      imageUrl,
      category
    });
        await novoItem.save();
        res.status(201).json(novoItem);
  } catch (error) {
    res.status(400).json({ message: 'Dados inválidos ou incompletos.'});
  }
});

app.patch('/itens/:id', async (req, res) => {
  try {
    // 1. Pegamos o ID do item a ser atualizado a partir dos parâmetros da URL
    const { id } = req.params;

    // 2. Pegamos os dados que queremos atualizar a partir do corpo da requisição
    const updates = req.body;

    // 3. Usamos o método findByIdAndUpdate do Mongoose para atualizar o item
    const updateItem = await Item.findByIdAndUpdate(id, updates, { new: true });

    if (!updateItem) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }
    res.json(updateItem);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar o item.' });
  }
});

app.delete('/itens/:id', async (req, res) => {
  try {
    // 1. Pegamos o ID do item a ser deletado
    const { id } = req.params;

    // 2. Usamos o método "findByIdAndDelete" para encontrar e remover o item
    const deletedItem = await Item.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }

    // 3. Respondemos com uma mensagem de sucesso
    res.json({ message: 'Item deletado com sucesso!' });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar o item', error: error.message });
  }
});

app.get('/', (request, response) => {
  response.send('Olá! Meu primeiro servidor está no ar! 🎉');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});