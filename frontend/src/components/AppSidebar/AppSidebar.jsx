import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Importei useLocation para destacar o botão ativo
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
import DashboardIcon from '@mui/icons-material/Dashboard'; // Novo
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'; // Novo

import logoPath from '../../assets/burger-queen-logo.png';

const AppSidebar = ({ children, user, actionButton, hideDesktopAction = false, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Para saber em qual página estamos

  const userName = user?.name || 'Usuário';
  const userImage = user?.imageUrl || null;
  const userRole = user?.role === 'admin' ? 'Administrador' : (user?.role === 'hall' ? 'Garçom' : 'Cozinha');

  // Função interna de logout caso não seja passada via props, mas idealmente usa a prop onLogout
  const handleLogoutClick = () => {
     if (onLogout) {
         onLogout();
     } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
     }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', flexDirection: { xs: 'column', md: 'row' }, bgcolor: '#f4f6f8' }}>
      
      {/* === HEADER MOBILE (Apenas telas pequenas) === */}
      <AppBar position="static" sx={{ display: { md: 'none' }, bgcolor: 'background.paper' }}>
        <Toolbar>
          <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
             <img src={logoPath} alt="Logo" style={{ height: 40 }} />
          </Box>
          <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'text.primary' }}>
            {userName.split(' ')[0]} 
          </Typography>
          
          {actionButton && <Box sx={{ mr: 1 }}>{actionButton}</Box>}

          <IconButton color="default" onClick={handleLogoutClick}>
              <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* === SIDEBAR (Apenas Desktop) === */}
      <Paper
        elevation={3}
        sx={{ 
          width: 260, 
          flexShrink: 0, 
          bgcolor: '#ffffff', 
          color: 'text.primary', 
          display: { xs: 'none', md: 'flex' }, 
          flexDirection: 'column', 
          p: 2
        }}
      >
        <Box sx={{ textAlign: 'center', p: 1, mb: 2 }}>
            <img src={logoPath} alt="Burger Queen Logo" style={{ width: '70%', height: 'auto' }} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar 
            src={userImage} 
            sx={{ width: 70, height: 70, mb: 1, bgcolor: 'primary.main', border: '3px solid #eee' }}
          >
            {!userImage ? userName.charAt(0).toUpperCase() : null}
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            {userName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', bgcolor: 'grey.100', px: 1, borderRadius: 1 }}>
            {userRole}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* --- NOVO MENU DE NAVEGAÇÃO (Só aparece para Admin) --- */}
        {userRole === 'Administrador' && (
            <Box sx={{ width: '100%', mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                    fullWidth 
                    startIcon={<DashboardIcon />}
                    onClick={() => navigate('/dashboard')}
                    variant={location.pathname === '/dashboard' ? "contained" : "text"} // Destaca se estiver ativo
                    color={location.pathname === '/dashboard' ? "primary" : "inherit"}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 'bold' }}
                >
                   Menu / Produtos
                </Button>

                <Button 
                    fullWidth 
                    startIcon={<PointOfSaleIcon />}
                    onClick={() => navigate('/financeiro')}
                    variant={location.pathname === '/financeiro' ? "contained" : "text"}
                    color={location.pathname === '/financeiro' ? "primary" : "inherit"}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 'bold' }}
                >
                   Financeiro (Caixa)
                </Button>
            </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Botão de Ação Extra (Ex: Adicionar Item no Dashboard) */}
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
            onClick={handleLogoutClick} 
            sx={{ borderColor: 'error.light', color: 'error.main', '&:hover': { bgcolor: 'error.50' } }}
          >
            Sair
          </Button>
        </Box>
      </Paper>

      {/* === ÁREA DE CONTEÚDO PRINCIPAL === */}
      <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', bgcolor: '#f4f6f8', height: '100%' }}>
        {children}
      </Box>

    </Box>
  );
};

export default AppSidebar;