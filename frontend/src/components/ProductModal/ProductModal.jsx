import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
  Checkbox,
  IconButton
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CloseIcon from '@mui/icons-material/Close';

const ProductModal = ({ isOpen, onClose, product, onAddToCart }) => {
  const [burgerType, setBurgerType] = useState('bovino');
  const [extras, setExtras] = useState({ queijo: false, ovo: false });

  useEffect(() => {
    if (isOpen) {
      setBurgerType('bovino');
      setExtras({ queijo: false, ovo: false });
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  // --- REGRAS DE EXIBIÇÃO ---
  // É um Hambúrguer? (Para mostrar opção de carne e ovo)
  const isBurger = product.category === 'Lanches'; 
  
  // É Bebida? (Para esconder todos os extras)
  const isDrink = product.category === 'Bebidas';

  // Pode ter Queijo? (Hambúrgueres e Acompanhamentos/Batata)
  const canAddCheese = !isDrink;

  // Pode ter Ovo? (Apenas Hambúrgueres)
  const canAddEgg = isBurger; 

  const handleExtraChange = (extra) => {
    setExtras((prev) => ({ ...prev, [extra]: !prev[extra] }));
  };

  // Calcula o preço total visualmente
  const getCurrentTotal = () => {
    let total = product.price;
    if (canAddCheese && extras.queijo) total += 1.00; 
    if (canAddEgg && extras.ovo) total += 1.00;   
    return total;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let price = product.price;
    let name = product.name;
    let details = [];

    if (isBurger) {
      details.push(burgerType);
    }

    if (canAddCheese && extras.queijo) {
      price += 1;
      details.push('queijo');
    }
    if (canAddEgg && extras.ovo) {
      price += 1;
      details.push('ovo');
    }

    if (details.length > 0) {
      name = `${product.name} (${details.join(', ')})`;
    }

    const cartItem = {
      ...product,
      name,
      price,
      orderItemId: Date.now()
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit}>
        {/* HEADER */}
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6" fontWeight="bold">
            {product.name}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                    R$ {getCurrentTotal().toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Preço base: R$ {product.price.toFixed(2)}
                </Typography>
            </Box>

            {/* OPÇÃO 1: TIPO DE CARNE (Apenas se for Lanche) */}
            {isBurger && (
                <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
                           Escolha a Carne:
                        </FormLabel>
                        <RadioGroup
                            row
                            name="burgerType"
                            value={burgerType}
                            onChange={(e) => setBurgerType(e.target.value)}
                        >
                            <FormControlLabel value="bovino" control={<Radio color="primary" />} label="Bovino" />
                            <FormControlLabel value="frango" control={<Radio color="primary" />} label="Frango" />
                            <FormControlLabel value="vegetariano" control={<Radio color="success" />} label="Vegetariano" />
                        </RadioGroup>
                    </FormControl>
                </Box>
            )}

            {/* OPÇÃO 2: EXTRAS (Se não for bebida) */}
            {!isDrink && (
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <FormControl component="fieldset" variant="standard">
                        <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
                            Turbine seu pedido (+ R$ 1,00 cada):
                        </FormLabel>
                        <FormGroup row>
                            {canAddCheese && (
                              <FormControlLabel
                                  control={
                                      <Checkbox checked={extras.queijo} onChange={() => handleExtraChange('queijo')} />
                                  }
                                  label="Queijo Extra"
                              />
                            )}
                            
                            {canAddEgg && (
                              <FormControlLabel
                                  control={
                                      <Checkbox checked={extras.ovo} onChange={() => handleExtraChange('ovo')} />
                                  }
                                  label="Ovo"
                              />
                            )}
                        </FormGroup>
                    </FormControl>
                </Box>
            )}
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button onClick={onClose} color="inherit" sx={{color:'#666'}}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<AddShoppingCartIcon />}
            size="large"
            sx={{ fontWeight: 'bold', px: 4 }}
          >
            Adicionar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductModal;