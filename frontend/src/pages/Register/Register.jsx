import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; 
import { toast } from 'react-toastify';
// --- IMPORTAÇÕES DO MUI ---
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert'; // Para erros
// Componentes para o Dropdown de "Função"
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
// Ícones
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';

import { registerUser } from '../../services/api';

function Register() {
  const navigate = useNavigate();
  
  // Estados do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('hall'); 
  const [profileImage, setProfileImage] = useState(null);
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); 

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(''); 

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', role);

    if (profileImage) {
      formData.append('profileImage', profileImage); 
    }
    
    try {
      const result = await registerUser(formData); 
      toast.success(result.message || 'Usuário registrado com sucesso!'); 
      navigate('/login');
    } catch (err) {
      console.error('Erro no registro:', err);
      setError(err.message || 'Erro ao registrar. Verifique os dados.'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          marginBottom: 8, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '700px',
          margin: 'auto',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}> 
          <PersonAddAltIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Registrar Novo Funcionário
        </Typography>
        
        {/* Formulário */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 5, width: '100%' }}>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <TextField
                autoComplete="name"
                name="name"
                required
                fullWidth
                id="name"
                label="Nome Completo"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="password"
                label="Senha"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="role-select-label">Função</InputLabel>
                <Select
                  labelId="role-select-label"
                  id="role"
                  value={role}
                  label="Função"
                  onChange={(e) => setRole(e.target.value)}
                >
                  <MenuItem value="hall">Salão (Garçom)</MenuItem>
                  <MenuItem value="kitchen">Cozinha</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid  xs={12} sm={6}>
              <Button
                variant="outlined"
                component="label" 
                fullWidth
              >
                Upload Foto de Perfil
                <input 
                  type="file" 
                  hidden // O input real fica escondido
                  accept="image/png, image/jpeg" 
                  onChange={(e) => setProfileImage(e.target.files[0])} 
                />
              </Button>
                {profileImage && (
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  Arquivo: {profileImage.name}
                </Typography>
              )}
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary" 
            disabled={loading}
            sx={{ mt: 3, mb: 2, p: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrar'}
          </Button>
          
          <Grid container justifyContent="flex-end">
            <Grid>
              <Link component={RouterLink} to="/login" variant="body2">
                {"Já tem uma conta? Faça login"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}

export default Register;