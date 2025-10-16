const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const itemRoutes = require('./routes/items');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');

require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());
app.use('api/auth', authRoutes);
app.use('/api/itens', authMiddleware, itemRoutes);

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('✅ Conectado ao MongoDB Atlas'))
  .catch((error) => console.log('❌ Erro ao conectar ao MongoDB Atlas:', error));

// ROTAS DE AUTENTICAÇÃO
app.use('/api/auth', authRoutes);


app.get('/', (request, response) => {
  response.send('Olá! Meu primeiro servidor está no ar! 🎉');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});