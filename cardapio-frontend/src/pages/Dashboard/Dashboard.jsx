import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

// --- IMPORTAÇÕES DO MUI ---
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from "@mui/material/Chip";
// Ícones
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// -------------------------

import { getItems, createItem, deleteItem, updateItem } from "../../services/api.js";
import ItemModal from "../../components/ItemModal/ItemModal";
import ConfirmToast from '../../components/ConfirmToast/ConfirmToast'; 

function Dashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]); // Guarda a lista de itens
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(''); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [editingItem, setEditingItem] = useState(null); 

  // Busca inicial dos itens
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true); 
        setError(''); 
        const data = await getItems();
        setItems(data);
      } catch (error) {
        console.error('Erro ao buscar itens:', error);
        setError('Erro ao buscar itens. Tente novamente mais tarde.');
        toast.error('Erro ao buscar itens.'); 
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Abre modal para editar
  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Abre modal para criar
  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  // Fecha modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (itemData) => {
    try {
      if (editingItem) {
        const updatedItem = await updateItem(editingItem._id, itemData);
        setItems(items.map(item => item._id === updatedItem._id ? updatedItem : item));
        toast.success('Item atualizado com sucesso!');
      } else {
        const newItem = await createItem(itemData);
        setItems([...items, newItem]);
        toast.success('Item criado com sucesso!');
      }
      handleCloseModal();
    } catch (err) {
      console.error("Falha ao salvar item:", err);
      setError('Não foi possível salvar o item.');
      toast.error(err.message || 'Não foi possível salvar o item.'); 
    }
  };

  const executeDelete = async (id) => {
    try {
      await deleteItem(id);
      setItems(items.filter(item => item._id !== id));
      toast.success('Item deletado com sucesso!');
    } catch (err) {
      console.error("Falha ao deletar item:", err);
      setError('Não foi possível deletar o item.');
      toast.error('Não foi possível deletar o item.');
    }
  };

  const handleDeleteConfirmation = (id) => {
    toast(
      ({ closeToast }) => (
        <ConfirmToast
          closeToast={closeToast}
          onConfirm={() => executeDelete(id)}
          message="Tem certeza que deseja deletar este item?"
        />
      ),
      { position: "top-center", autoClose: false, closeOnClick: false, draggable: false, closeButton: true, pauseOnHover: true, }
    );
  };

  if (loading) {
    return <Typography sx={{ textAlign: 'center', mt: 5 }}>Carregando cardápio...</Typography>;
  }

  // --- RENDERIZAÇÃO PRINCIPAL COM MUI ---
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>

      <AppBar position="static" sx={{ mb: 3, bgcolor: 'primary' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard - Gerenciamento do Cardápio
          </Typography>
          <Box>
            <Button color="inherit" startIcon={<AddIcon />} onClick={handleAddNew} sx={{ mr: 1 }}>
              Adicionar Item
            </Button>
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Typography variant="h5" component="h2" gutterBottom>
          Itens do Cardápio
      </Typography>

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      {/* Grid de Itens */}
      {items.length === 0 && !error ? (
          <Typography sx={{ mt: 3 }}>Nenhum item cadastrado. Clique em "Adicionar Item" para começar.</Typography>
      ) : (
          <Grid container spacing={4} justifyContent="center">
            {items.map(item => (
              <Grid item key={item._id} xs={12} sm={6} md={4} lg={3} >
                <Card sx={{
                    maxWidth: 300,
                    minWidth: 300,
                    height: 420, 
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 3
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140" 
                    image={item.imageUrl || 'https://via.placeholder.com/300x160?text=Sem+Imagem'}
                    alt={item.name}
                    sx={{ objectFit: 'contain' }} 
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 1.5 }}>
                    <Typography
                      variant="h6"
                      color= 'primary.contrastText'
                      component="div"
                      title={item.name}
                      sx={{
                        fontWeight: 500,
                        lineHeight: 1.3,
                        height: 'calc(1.3em * 2)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        mb: 0.5,
                      }}
                    >
                      {item.name}
                    </Typography>
        
                    <Typography
                      variant="body2"
                      color="primary.contrastText2"
                      title={item.description}
                      sx={{
                        lineHeight: 1.4,
                        height: 'calc(1.2em * 3)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        mb: 1,
                        flexGrow: 1
                      }}
                    >
                      {item.description}
                    </Typography>
                    
                    <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold', mt: 'auto' }}>
                      R$ {item.price.toFixed(2)}
                    </Typography>

                    <Chip 
                      label={item.category} 
                      size="small"         
                      color="secondary"    
                      sx={{ 
                      mt: 1,  
                      alignSelf: 'flex-start' 
                      }} 
                    />
                    <Chip 
                      label={item.menu} 
                      size="small"         
                      color="secondary"    
                      sx={{ 
                      mt: 1,  
                      alignSelf: 'flex-start' 
                      }} 
                    />
                  </CardContent>
                
                  <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                    <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(item)}>
                      Editar
                    </Button>
                    <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteConfirmation(item._id)}>
                      Deletar
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
      )}

      {/* Modais */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        currentItem={editingItem}
      />
      {/* O ToastContainer está no App.jsx */}

    </Container>
  );
}

export default Dashboard;