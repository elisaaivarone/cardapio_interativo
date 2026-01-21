import { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper } from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../services/api'; 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Chama a ROTA 1 do backend
      const response = await api.post('/auth/reset-password', { email });
      toast.success(response.data.message);
      toast.info('Olhe o terminal do VS Code para pegar o link!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao solicitar.');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
            Recuperar Senha
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Digite seu e-mail para receber o link.
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              required fullWidth label="Seu E-mail" type="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              ENVIAR LINK
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;