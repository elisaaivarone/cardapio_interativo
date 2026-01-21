import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const ConfirmToast = ({ closeToast, onConfirm }) => {
  return (
    <Box>
      {/* Cabeçalho com Ícone */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'error.main' }}>
        <WarningAmberIcon />
        <Typography variant="subtitle1" fontWeight="bold">
          Confirmação
        </Typography>
      </Box>

      {/* Mensagem */}
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        {'Tem certeza que deseja deletar este item?'}
      </Typography>

      {/* Botões de Ação */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button 
          onClick={closeToast} 
          size="small" 
          color="inherit"
          sx={{ textTransform: 'none' }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={() => {
            onConfirm();
            closeToast();
          }} 
          variant="contained" 
          color="error" 
          size="small"
          sx={{ fontWeight: 'bold', textTransform: 'none' }}
        >
          Sim, Deletar
        </Button>
      </Box>
    </Box>
  );
};

export default ConfirmToast;