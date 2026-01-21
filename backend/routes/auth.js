const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const upload = require('../middleware/upload.js');

const User = require('../models/User');
const Invite = require('../models/Invite');

// ==========================================
// 1. ROTAS DE AUTENTICAÇÃO PADRÃO
// ==========================================

// ROTA DE REGISTRO (POST /api/auth/register)
router.post('/register', upload.single('profileImage'), async (req, res) => {
  try {
    const { name, email, password, whatsapp } = req.body;

    const role = req.body.role || 'client';

    const validRoles = ['admin', 'hall', 'kitchen', 'client'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Função (role) inválida.' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Usuário já existe.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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
      imageUrl,
      whatsapp: whatsapp || ''
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

// ==========================================
// 2. SISTEMA DE CONVITE (EQUIPE)
// ==========================================

router.get('/invite/:token', async (req, res) => {
  try {
    const invite = await Invite.findOne({ token: req.params.token });
    
    if (!invite) {
      return res.status(404).json({ valid: false, error: 'Convite inválido ou expirado.' });
    }

    res.json({ 
      valid: true, 
      email: invite.email, 
      role: invite.role 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao validar convite.' });
  }
});

// ROTA: COMPLETAR CADASTRO VIA CONVITE (POST)
router.post('/register-invite', async (req, res) => {
  try {
    const { token, name, password, whatsapp } = req.body; 

    // 1. Busca o convite pelo token
    const invite = await Invite.findOne({ token });
    if (!invite) return res.status(400).json({ error: 'Convite inválido ou expirado.' });

    // 2. Segurança extra: vê se o email já foi usado
    const userExists = await User.findOne({ email: invite.email });
    if (userExists) return res.status(400).json({ error: 'Email já cadastrado.' });

    // 3. Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Cria o usuário usando o EMAIL e ROLE do convite + NOME e WHATSAPP do formulário
    const newUser = new User({
      name,
      email: invite.email, // Vem do convite (travado)
      password: hashedPassword,
      role: invite.role,   // Vem do convite (travado)
      whatsapp: whatsapp || '' 
    });

    await newUser.save();

    // 5. Apaga o convite para não ser usado de novo
    await Invite.findByIdAndDelete(invite._id);

    res.status(201).json({ message: 'Cadastro concluído! Faça login.' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. RECUPERAÇÃO DE SENHA (ESQUECI SENHA)
// ==========================================

// ROTA 1: SOLICITA O LINK (Gera Token)
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'E-mail não encontrado.' });

    // Gera token aleatório
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Salva o token hash no banco (segurança) e define validade de 1 hora
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hora
    await user.save();

    // Cria o Link
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // --- LOG PARA TESTE (SIMULA O ENVIO DE EMAIL) ---
    console.log(`\n📧 E-MAIL DE RECUPERAÇÃO PARA ${email}:`);
    console.log(`🔗 Link: ${resetUrl}\n`);
    // ------------------------------------------------

    res.json({ message: 'E-mail de recuperação enviado (Verifique o console do servidor).' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar solicitação.' });
  }
});

// ROTA: REDEFINIR A SENHA (POST)
router.post('/reset-password/:resetToken', async (req, res) => {
  try {
    // Recria o hash para comparar com o banco
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    // Busca usuário com esse token válido e que não expirou ainda
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() } // $gt = maior que agora
    });

    if (!user) return res.status(400).json({ error: 'Link inválido ou expirado.' });

    // Define nova senha criptografada
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    
    // Limpa os tokens de recuperação
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Senha alterada com sucesso! Faça login.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;