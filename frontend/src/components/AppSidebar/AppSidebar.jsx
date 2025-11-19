import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
// Ícones
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import logoPath from '../../assets/burger-queen-logo.png';

const AppSidebar = ({ children, user, actionButton, hideDesktopAction = false }) => {
  const navigate = useNavigate();

  const userName = user?.name || 'Usuário';
  const userImage = user?.imageUrl || null;
  const userRole = user?.role === 'admin' ? 'Administrador' : (user?.role === 'hall' ? 'Garçom' : 'Cozinha');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', flexDirection: { xs: 'column', md: 'row' }, bgcolor: '#f4f6f8' }}>
      
      {/* === HEADER MOBILE (Apenas telas pequenas) === */}
      <AppBar position="static" sx={{ display: { md: 'none' }, bgcolor: 'background.paper' }}>
        <Toolbar>
          <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
             <img src={logoPath} alt="Logo" style={{ height: 50 }} />
          </Box>
          <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            {userName.split(' ')[0]} 
          </Typography>
          
          {actionButton && <Box sx={{ mr: 1 }}>{actionButton}</Box>}

          <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* === SIDEBAR (Apenas Desktop) === */}
      <Paper
        elevation={3}
        sx={{ 
          width: 240, 
          flexShrink: 0, 
          bgcolor: '#ffffff', 
          color: 'text.primary', 
          display: { xs: 'none', md: 'flex' }, 
          flexDirection: 'column', 
          p: 2
        }}
      >
        <Box sx={{ textAlign: 'center', p: 1, mb: 2 }}>
            <img src={logoPath} alt="Burger Queen Logo" style={{ width: '60%', height: 'auto' }} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar 
            src={userImage} 
            sx={{ width: 64, height: 64, mb: 1, bgcolor: 'primary.main' }}
          >
            {!userImage ? userName.charAt(0).toUpperCase() : null}
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            Olá, {userName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {userRole}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Botão de Ação Principal Adicionar Item na Sidebar */}
        {actionButton && !hideDesktopAction && (
            <Box sx={{ mb: 2 }}>
                {actionButton}
            </Box>
        )}

        <Box sx={{ mt: 'auto' }}>
           <Button 
            variant="outlined" 
            color="error" 
            fullWidth 
            startIcon={<LogoutIcon />} 
            onClick={handleLogout} 
            sx={{ borderColor: 'secondary.main', color: 'secondary.main' }}
          >
            Logout
          </Button>
        </Box>
      </Paper>

      {/* === ÁREA DE CONTEÚDO PRINCIPAL === */}

      <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', bgcolor: 'background.default' }}>
        {children}
      </Box>

    </Box>
  );
};

export default AppSidebar;