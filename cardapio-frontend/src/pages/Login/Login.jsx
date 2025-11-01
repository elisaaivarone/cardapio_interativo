import { useState } from 'react';
import { useNavigate,Link as RouterLink } from 'react-router-dom';
import { loginUser } from '../../services/api';
import { jwtDecode } from 'jwt-decode'; 
// --- IMPORTAÇÕES DO MUI ---
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline'; // Garante fundo consistente
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link'; // O Link do MUI
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress'; // Para o loading
import Alert from '@mui/material/Alert'; // Para exibir erros
// Ícones
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';


function Login() {
  // Criando "estados" para guardar o email e a senha
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  
  // Função que faz o envio do formulário
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. CHAME A API E PEGUE OS DADOS 
      const data = await loginUser(email, password);
      
      // 2. SALVE O TOKEN NO LOCALSTORAGE
      localStorage.setItem('token', data.token);

      // 3. DECODIFIQUE O TOKEN PARA PEGAR O USUÁRIO (incluindo o role)
      const user = jwtDecode(data.token).user; 
      
      localStorage.setItem('user', JSON.stringify(user));

      // 4. DECIDA PARA ONDE IR usando 'navigate
      if (user.role === 'admin') {
        navigate('/dashboard');
      } else if (user.role === 'hall') {
        navigate('/order');
      } else if (user.role === 'kitchen') {
        navigate('/kitchen');
      }

    } catch (err) {
      setError('Email ou senha inválidos. Tente novamente.');
      console.error('Erro no login:', err);
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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Acessar Painel
        </Typography>
        
        {/* Formulário */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 1 }}>
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
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
          </Button>
        
          <Grid container justifyContent="flex-end">
            <Grid item>
              {/* Usamos o Link do MUI e passamos o Link do Router para a prop 'component' */}
              <Link component={RouterLink} to="/register" variant="body2">
                {"Não tem uma conta? Registre-se aqui"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;