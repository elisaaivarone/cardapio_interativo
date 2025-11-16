const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const upload = require('../middleware/upload.js');

const router = express.Router();

// ROTA DE REGISTRO (POST /api/auth/register)
router.post('/register', upload.single('profileImage'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!role || !['admin', 'hall', 'kitchen'].includes(role)) {
      return res.status(400).json({ message: 'Função (role) inválida ou não fornecida.' });
    }
    // Verifica se o usuário já existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Usuário já existe.' });
    }
    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Define a URL da imagem de perfil, se fornecida
    let imageUrl = null;
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Cria o novo usuário
    user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role,
      imageUrl
    });

    await user.save();

    res.status(201).json({ message: 'Usuário registrado com sucesso!' });

  } catch (error) {
    console.error("Erro no registro:", error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
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
    const payload = { 
      user: { 
        id: user.id,
        role: user.role,
        name: user.name,
        imageUrl: user.imageUrl
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: 'Erro no servidor.', error: error.message });
  }
});

module.exports = router;