import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, TextField,
  Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
  Divider
} from '@mui/material';
// Ícones
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PixIcon from '@mui/icons-material/QrCode'; 

const PaymentModal = ({ isOpen, onClose, order, onConfirmPayment }) => {
  const [method, setMethod] = useState('credit');
  const [cashReceived, setCashReceived] = useState('');
  const [change, setChange] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCashReceived(''); 
      setChange(0);
      setMethod('credit'); 
    }
  }, [isOpen]);

  // Calcula o troco automaticamente quando o valor recebido muda
  useEffect(() => {
    if (method === 'cash' && order) {
      const received = parseFloat(cashReceived) || 0;
      setChange(received - order.totalPrice);
    } else {
      setChange(0);
    }
  }, [cashReceived, method, order]);

  const handlePayment = () => {
    if (method === 'cash' && (parseFloat(cashReceived) < order.totalPrice)) {
        alert("Valor insuficiente!");
        return;
    }

    onConfirmPayment(order._id, {
      paymentMethod: method,
      amountPaid: method === 'cash' ? parseFloat(cashReceived) : order.totalPrice
    });
    onClose();
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', textAlign: 'center' }}>
        Pagamento do Pedido #{order._id.slice(-4)}
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h6" color="text.secondary">Total a Pagar</Typography>
            <Typography variant="h3" color="primary" fontWeight="bold">
                R$ {order.totalPrice.toFixed(2)}
            </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend">Forma de Pagamento</FormLabel>
          <RadioGroup
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <FormControlLabel 
                value="credit" 
                control={<Radio />} 
                label={<Box sx={{display:'flex', alignItems:'center'}}><CreditCardIcon sx={{mr:1}}/> Cartão de Crédito</Box>} 
            />
            <FormControlLabel 
                value="debit" 
                control={<Radio />} 
                label={<Box sx={{display:'flex', alignItems:'center'}}><CreditCardIcon sx={{mr:1}}/> Cartão de Débito</Box>} 
            />
            <FormControlLabel 
                value="pix" 
                control={<Radio />} 
                label={<Box sx={{display:'flex', alignItems:'center'}}><PixIcon sx={{mr:1}}/> PIX</Box>} 
            />
            <FormControlLabel 
                value="cash" 
                control={<Radio />} 
                label={<Box sx={{display:'flex', alignItems:'center'}}><AttachMoneyIcon sx={{mr:1}}/> Dinheiro</Box>} 
            />
          </RadioGroup>
        </FormControl>

        {/* Área de Dinheiro e Troco (Só aparece se selecionar Dinheiro) */}
        {method === 'cash' && (
            <Box sx={{ mt: 2, bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                <TextField
                    label="Valor Recebido (R$)"
                    type="number"
                    fullWidth
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    autoFocus
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography fontWeight="bold">Troco:</Typography>
                    <Typography fontWeight="bold" color={change < 0 ? 'error' : 'success'}>
                        R$ {change.toFixed(2)}
                    </Typography>
                </Box>
            </Box>
        )}

      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button 
            onClick={handlePayment} 
            variant="contained" 
            color="success" 
            fullWidth
            size="large"
        >
            Confirmar Pagamento
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;