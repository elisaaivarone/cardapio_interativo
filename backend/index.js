const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const itemRoutes = require('./routes/items');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const authMiddleware = require('./middleware/authMiddleware');

// ROTAS DE CAIXA
const cashierRoutes = require('./routes/cashier');

// ROTAS DE TIME
const teamRoutes = require('./routes/team');
const userRoutes = require('./routes/user');

require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('✅ Conectado ao MongoDB Atlas'))
  .catch((error) => console.log('❌ Erro ao conectar ao MongoDB Atlas:', error));

// ROTAS DE AUTENTICAÇÃO
app.use('/api/auth', authRoutes);
app.use('/api/itens', authMiddleware, itemRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/cashier', authMiddleware, cashierRoutes);
app.use('/api/team', authMiddleware, teamRoutes); 
app.use('/api/users', authMiddleware, userRoutes);

app.get('/', (request, response) => {
  response.send('Olá! Meu primeiro servidor está no ar! 🎉');
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;