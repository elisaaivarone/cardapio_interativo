import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { Container, Box, Typography, TextField, Button, Paper } from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { token } = useParams(); // Pega o código da URL
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error('As senhas não coincidem.');

    try {
      // Chama a ROTA 2 do backend passando o token na URL e a senha no corpo
      await api.post(`/auth/reset-password/${token}`, { password });
      
      toast.success('Senha alterada! Faça login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Link inválido ou expirado.');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
            Nova Senha
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal" required fullWidth label="Nova Senha" type="password"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              margin="normal" required fullWidth label="Confirmar Senha" type="password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
              SALVAR SENHA
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword;