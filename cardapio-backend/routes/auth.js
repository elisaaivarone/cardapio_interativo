const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// ROTA DE REGISTRO (POST /api/auth/register)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verifica se o usuário já existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Usuário já existe.' });
    }

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Cria o novo usuário
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Usuário registrado com sucesso!' });

  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.', error: error.message });
  }
});

// ROTA DE LOGIN (POST /api/auth/login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Procura o usuário pelo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    // Compara a senha enviada com a senha criptografada no banco
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    // Se as senhas batem, cria um Token JWT
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });

  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.', error: error.message });
  }
});

module.exports = router;