import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  IconButton,
  InputAdornment
} from '@mui/material';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

import logo from '../../assets/burger-queen-logo.png';
import { registerUser } from '../../services/api'; 

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error('As senhas não coincidem.');
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('whatsapp', whatsapp);
      formData.append('role', 'client'); 
      
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      await registerUser(formData);

      toast.success('Cadastro realizado com sucesso!');
 
      // Futuramente logar direto e mandar pro /delivery
      navigate('/login'); 
      
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erro ao cadastrar.');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <img src={logo} alt="Logo Queen Burger" style={{ width: 120, marginBottom: 16 }} />
        
        <Paper elevation={3} sx={{ padding: 4, width: '100%', borderRadius: 2 }}>
          <Typography component="h1" variant="h5" align="center" fontWeight="bold" gutterBottom>
            Crie sua conta
          </Typography>
          <Typography variant="body2" color="primary.contrastText2" align="center" sx={{ mb: 3 }}>
            Peça seu lanche favorito em instantes!
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="profile-image-upload">
                <IconButton component="span" sx={{ p: 0 }}>
                  <Avatar
                    src={previewImage}
                    sx={{ width: 80, height: 80, bgcolor: 'secondary.main' }}
                  >
                    <CloudUploadIcon />
                  </Avatar>
                </IconButton>
              </label>
            </Box>
            <Typography variant="caption" display="block" align="center" color="primary.contrastText2" sx={{ mb: 2 }}>
              Toque na foto para alterar
            </Typography>

            <TextField
              margin="normal"
              required
              fullWidth
              label="Nome Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              color="secondary.light"
            />
            <TextField
              margin="normal" required fullWidth
              label="WhatsApp"
              placeholder="(00) 00000-0000"
              value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
              color="secondary"
              slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <WhatsAppIcon color="secondary" /> 
                        </InputAdornment>
                    ),
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              color="secondary.light"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              color="secondary.light"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirmar Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              color="secondary.light"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, bgcolor: 'secondary.main', fontWeight: 'bold', '&:hover': { bgcolor: 'secondary.dark' } }}
            >
              CADASTRAR
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link to="/login" style={{ textDecoration: 'none', color: '#166F58', fontSize: '0.9rem' }}>
                Já tem uma conta? Faça Login
              </Link>
            </Box>

          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;