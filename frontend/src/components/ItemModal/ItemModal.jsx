import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  InputAdornment
} from "@mui/material";

import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

function ItemModal({ isOpen, onClose, onSave, currentItem }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("Lanches");
  const [menu, setMenu] = useState("allDay");

  // Preenche os campos se estiver editando
  useEffect(() => {
    if (isOpen && currentItem) {
      setName(currentItem.name);
      setDescription(currentItem.description);
      setPrice(currentItem.price);
      setImageUrl(currentItem.imageUrl);
      setCategory(currentItem.category);
      setMenu(currentItem.menu || 'allDay');
    } else {
      // Limpa se for criar novo
      setName("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      setCategory("Lanches");
      setMenu("allDay");
    }
  }, [isOpen, currentItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const itemData = {
      name,
      description,
      price: Number(price),
      imageUrl,
      category,
      menu
    };
    onSave(itemData);
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
          {currentItem ? "Editar Item" : "Adicionar Novo Item"}
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nome do Item"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Descrição"
              fullWidth
              required
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Preço"
                  type="number"
                  required
                  fullWidth
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
                
                <TextField
                  select
                  label="Categoria"
                  fullWidth
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <MenuItem value="Lanches">Lanches</MenuItem>
                  <MenuItem value="Bebidas">Bebidas</MenuItem>
                  <MenuItem value="Sobremesas">Sobremesas</MenuItem>
                  <MenuItem value="Acompanhamentos">Acompanhamentos</MenuItem>
                </TextField>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  select
                  label="Tipo de Cardápio"
                  fullWidth
                  value={menu}
                  onChange={(e) => setMenu(e.target.value)}
                >
                  <MenuItem value="allDay">Resto do Dia (Almoço/Jantar)</MenuItem>
                  <MenuItem value="breakfast">Café da Manhã</MenuItem>
                </TextField>
            </Box>

            <TextField
                label="URL da Imagem"
                fullWidth
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                helperText="Cole o link direto da imagem aqui"
            />

          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={onClose} 
            color="inherit" 
            startIcon={<CancelIcon />}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary.main"
            startIcon={<SaveIcon />}
            sx={{ fontWeight: 'bold' }}
          >
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ItemModal;