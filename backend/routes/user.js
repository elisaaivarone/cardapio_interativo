const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const upload = require('../middleware/upload');

// 1. ATUALIZAR PERFIL
router.put('/profile', async (req, res) => {
  try {
    const { userId, name, whatsapp } = req.body; 

    // Procura e atualiza
    const user = await User.findByIdAndUpdate(
      userId, 
      { name, whatsapp }, // Adicione outros campos aqui se tiver
      { new: true } // Retorna o usuário atualizado
    ).select('-password'); // Não devolve a senha

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

// 2. ALTERAR SENHA
router.put('/password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    // Confere a senha atual
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'A senha atual está incorreta.' });
    }

    // Criptografa a nova senha
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();

    res.json({ message: 'Senha alterada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao alterar senha.' });
  }
});

// 3. ALTERAR EMAIL
router.put('/email', async (req, res) => {
  try {
    const { userId, newEmail } = req.body;

    // Verifica se o email já existe em outro usuário
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
        return res.status(400).json({ error: 'Este e-mail já está em uso.' });
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { email: newEmail },
        { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao alterar e-mail.' });
  }
});

// ROTA: ATUALIZAR FOTO
router.put('/update-image', upload.single('image'), async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    // Cria a URL da imagem
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { imageUrl },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar imagem.' });
  }
});

module.exports = router;