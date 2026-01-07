import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
// MUI Components
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
// Ícones
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FastfoodIcon from '@mui/icons-material/Fastfood';
// Serviços e Componentes
import { getItems, createItem, deleteItem, updateItem } from "../../services/api.js";
import ItemModal from "../../components/ItemModal/ItemModal";
import ConfirmToast from '../../components/ConfirmToast/ConfirmToast';
import AppSidebar from "../../components/AppSidebar/AppSidebar.jsx"; 

function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUser(decoded.user); // Pega dados do usuário para o Sidebar
      fetchItems();
    } catch (error) {
      console.error("Erro detalhado:", error);
      navigate('/login');
    }
  }, [navigate]);

  const fetchItems = async () => {
    try {
      const data = await getItems();
      setItems(data);
    } catch (error) {
      console.error("Erro detalhado:", error);
      setError('Falha ao carregar itens.');
      toast.error('Erro ao carregar itens.');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleEdit = (item) => { 
    setEditingItem(item); 
    setIsModalOpen(true); 
  };

  const handleAddNew = () => { 
    setEditingItem(null); 
    setIsModalOpen(true); 
  };

  const handleCloseModal = () => { 
    setIsModalOpen(false); 
    setEditingItem(null); 
  };

  const handleSave = async (itemData) => {
    try {
      if (editingItem) {
        const updatedItem = await updateItem(editingItem._id, itemData);
        setItems(items.map(item => item._id === updatedItem._id ? updatedItem : item));
        toast.success('Atualizado!');
      } else {
        const newItem = await createItem(itemData);
        setItems([...items, newItem]);
        toast.success('Criado!');
      }
      handleCloseModal();
    } catch (error) {
      console.error("Erro detalhado:", error);
      toast.error('Erro ao salvar.'); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await deleteItem(id);
        toast.success('Item excluído!');
        fetchItems();
      } catch (error) {
        console.error(error);
        toast.error('Erro ao excluir item.');
      }
    }
  };

  const handleDeleteConfirmation = (id) => {
    toast(({ closeToast }) => (
        <ConfirmToast closeToast={closeToast} onConfirm={() => handleDelete(id)} message="Tem certeza?" />
    ), { position: "top-center", autoClose: false, closeOnClick: false });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  if (loading) return 
    <Box sx={{display:'flex', height:'100vh', justifyContent:'center', alignItems:'center'}}>
      <CircularProgress/>
    </Box>;

  return (
    <AppSidebar user={user} onLogout={handleLogout}>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <FastfoodIcon fontSize="large" color="primary" />
          Produtos
        </Typography>

        <Button 
          variant="contained" 
          color="success" 
          startIcon={<AddIcon />} 
          onClick={handleAddNew}
          sx={{ fontWeight: 'bold', px: 3 }}
        >
          Adicionar Novo Item
        </Button>
      </Box>
      
      <Divider sx={{ mb: 4 }} />
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {items.length === 0 && !error ? (
          <Typography sx={{ mt: 3 }}>Nenhum item cadastrado.</Typography>
      ) : (
          <Box 
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 3,
              // Ajustes manuais de responsividade para garantir uniformidade
              '@media (min-width: 1200px)': { gridTemplateColumns: 'repeat(4, 1fr)' }, 
              '@media (max-width: 899px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
              '@media (max-width: 600px)': { gridTemplateColumns: '1fr' }, 
            }}
          >
            {items.map(item => (
              <Card key={item._id} sx={{ height: '340px', display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: 3 }}>
                <CardMedia
                  component="img"
                  sx={{ height: 130, width: 'auto', maxWidth: '100%', objectFit: 'contain', p: 1, margin: '0 auto' }}
                  image={item.imageUrl || 'https://via.placeholder.com/300x160'}
                  alt={item.name}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 500, lineHeight: 1.2, mb: 0.5, height: '2.4em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {item.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        R$ {item.price.toFixed(2)}
                      </Typography>
                      <Chip 
                        label={item.category} 
                        size="small" 
                        color="default"
                        variant="outlined"
                      />
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 1, pt: 0 }}>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(item)}>Editar</Button>
                  <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteConfirmation(item._id)}>Deletar</Button>
                </CardActions>
              </Card>
            ))}
          </Box>
      )}

      <ItemModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} currentItem={editingItem} />
    </AppSidebar>
  );
}

export default Dashboard;