const express = require('express');
const router = express.Router();
const crypto = require('crypto'); // Para gerar o token aleatório
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Invite = require('../models/Invite');

// Middleware para garantir que só ADMIN acessa essas rotas
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

// 1. LISTAR TODOS OS MEMBROS (GET /api/team)
router.get('/', adminOnly, async (req, res) => {
  try {
    // Busca todos os usuários, exceto a senha
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. CRIAR UM CONVITE (POST /api/team/invite)
router.post('/invite', adminOnly, async (req, res) => {
  try {
    const { email, role } = req.body;

    // Verifica se já existe usuário com esse email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado no sistema.' });
    }

    // Verifica se já existe convite pendente
    const inviteExists = await Invite.findOne({ email });
    if (inviteExists) {
      return res.status(400).json({ error: 'Já existe um convite pendente para este e-mail.' });
    }

    // Gera um token aleatório (código único)
    const token = crypto.randomBytes(20).toString('hex');

    const newInvite = new Invite({
      email,
      role,
      token
    });

    await newInvite.save();

    // Aqui retornaríamos o LINK para o frontend mostrar
    // Ex: http://localhost:5173/register?token=xyz
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register-invite?token=${token}`;

    res.json({ 
      message: 'Convite gerado com sucesso!', 
      link: inviteLink,
      token: token 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. REMOVER USUÁRIO (DELETE /api/team/:id)
router.delete('/:id', adminOnly, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Usuário removido.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;