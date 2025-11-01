import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// --- IMPORTAÇÕES DO MUI ---
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';

// Ícones
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import CoffeeIcon from '@mui/icons-material/Coffee';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
// -------------------------

import { getItems, createOrder, getOrders, updateOrderStatus } from '../../services/api';
import ProductModal from '../../components/ProductModal/ProductModal'; 

// --- Caminho relativo para o logo ---
// Ajuste se o logo estiver em /src/assets ou outra pasta
import logoPath from '../../assets/burger-queen-logo.png'; // Assumindo /public/screenshots/burger-queen-logo.png

function Order() {
  const navigate = useNavigate();
  // --- Estados ---
  const [menuType, setMenuType] = useState('allDay');
  const [currentOrder, setCurrentOrder] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [breakfastItems, setBreakfastItems] = useState([]);
  const [allDayItems, setAllDayItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sendingOrder, setSendingOrder] = useState(false);
  const [activeTab, setActiveTab] = useState('current'); 
  const [readyOrders, setReadyOrders] = useState([]); 
  const [loadingReadyOrders, setLoadingReadyOrders] = useState(false); 
  const [errorReadyOrders, setErrorReadyOrders] = useState(''); 
  const [waiterName, setWaiterName] = useState('Garçom');


  
  // Busca Menus
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoadingMenu(true);
        const [breakfastData, allDayData] = await Promise.all([
          getItems({ menu: 'breakfast' }),
          getItems({ menu: 'allDay' })
        ]);
        setBreakfastItems(breakfastData);
        setAllDayItems(allDayData);
      } catch (error) {
        console.error("Erro ao buscar menus:", error);
        toast.error("Erro ao carregar os menus.");
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchMenus();
  }, []);

  // Busca Pedidos Prontos
  useEffect(() => {
    const fetchReadyOrders = async () => {
       try {
        setLoadingReadyOrders(true);
        setErrorReadyOrders('');
        const orders = await getOrders('ready');
        setReadyOrders(orders);
      } catch (error) {
        console.error("Erro ao buscar pedidos prontos:", error);
        setErrorReadyOrders('Não foi possível carregar os pedidos prontos.');
      } finally {
        setLoadingReadyOrders(false);
      }
    };
    if (activeTab === 'ready') {
        fetchReadyOrders();
        const intervalId = setInterval(fetchReadyOrders, 30000); // Atualiza a cada 30s
        return () => clearInterval(intervalId); // Limpa ao sair da aba
    }
  }, [activeTab]);

  // Pega nome do Garçom
  useEffect(() => {
      try {
          const user = JSON.parse(localStorage.getItem('user'));
          if (user && user.name) { setWaiterName(user.name); }
      } catch (e) { console.error("Erro ao ler usuário do localStorage", e)}
  }, []);
  

  // --- Funções Handler ---
  // Decide se abre modal ou adiciona direto
  const handleAddItem = (item) => {
    const needsCustomization =
      (item.category === 'Lanches' && item.menu === 'allDay') ||
      item.category === 'Acompanhamentos';
    if (needsCustomization) {
      setSelectedItem(item);
      setIsModalOpen(true);
    } else {
      handleAddToCart({ ...item, orderItemId: Date.now() });
    }
  };

  // Adiciona item ao carrinho (chamado pelo handleAddItem ou pelo Modal)
  const handleAddToCart = (item) => {
    setCurrentOrder([...currentOrder, item]);
  };

  // Remove item do carrinho
  const handleRemoveItem = (indexToRemove) => {
    const newOrder = currentOrder.filter((_, index) => index !== indexToRemove);
    setCurrentOrder(newOrder);
  };

  // Envia pedido para API
  const handleSendOrder = async () => {
    if (currentOrder.length === 0) { toast.warn('O pedido está vazio!'); return; }
    if (!customerName.trim()) { toast.warn('Por favor, insira o nome do cliente.'); return; }
    setSendingOrder(true);
    const orderData = {
      clientName: customerName.trim(),
      items: currentOrder.map(item => ({ productId: item._id, name: item.name, price: item.price })),
      totalPrice: total
    };
    try {
      await createOrder(orderData);
      toast.success(`Pedido para ${customerName} enviado!`);
      setCurrentOrder([]);
      setCustomerName('');
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      toast.error('Não foi possível enviar o pedido.');
    } finally { setSendingOrder(false); }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Marca pedido como entregue
  const handleMarkAsDelivered = async (orderId) => {
      try {
          await updateOrderStatus(orderId, 'delivered');
          setReadyOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
          toast.info('Pedido marcado como entregue.');
      } catch (err) {
          console.error("Erro ao marcar pedido como entregue:", err);
          toast.error('Não foi possível atualizar o status.');
      }
  };

  const menuToDisplay = menuType === 'breakfast' ? breakfastItems : allDayItems;
  const total = currentOrder.reduce((sum, item) => sum + item.price, 0);

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f4f6f8' }}>

      {/* === COLUNA ESQUERDA === */}
      <Paper
        elevation={3}
        sx={{ width: 220, flexShrink: 0, bgcolor: 'background.paper', color: 'white', display: 'flex', flexDirection: 'column', p: 1.5 }}
      >
        <Box sx={{ textAlign: 'center', p: 1, mb: 2 }}>
            <img src={logoPath} alt="Burger Queen Logo" style={{ width: '80%', height: 'auto' }} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar  sx={{ width: 56, height: 56, mb: 1, bgcolor: 'secondary.main' }}>
            {waiterName ? waiterName.charAt(0).toUpperCase() : <AccountCircleIcon />}
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{waiterName}</Typography>
          <Typography variant="caption" sx={{ color: 'secondary.main' }}>Garçom/Garçonete</Typography>
        </Box>
        <Divider sx={{ mb: 2, bgcolor: 'grey.700' }} />
        <Box sx={{ mt: 'auto' }}>
           <Button variant="outlined" color="error" fullWidth startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ borderColor: 'secondary.main', color: 'secondary.main' }}>
            Logout
          </Button>
        </Box>
      </Paper>

      {/* === COLUNA CENTRAL === */}
      <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', bgcolor: '#f4f6f8' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={menuType} 
              onChange={(event, newValue) => setMenuType(newValue)} 
              aria-label="menu tabs" 
              variant="fullWidth"
              >
                <Tab  label="Almoço / Jantar" value="allDay" icon={<FastfoodIcon />} iconPosition="start" />
                <Tab label="Café da Manhã" value="breakfast" icon={<CoffeeIcon />} iconPosition="start" />
            </Tabs>
        </Box>
        {loadingMenu ? (
          <Typography sx={{ textAlign: 'center', mt: 4 }}>Carregando...</Typography>
        ) : (
          <Box 
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 4,
              '@media (max-width: 1200px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
              '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
              '@media (max-width: 600px)': { gridTemplateColumns: 'repeat(1, 1fr)' },
            }}
          >
            {menuToDisplay.map(item => (
              <Card key={item._id}
                sx={{
                  height: '220px',
                  display: 'flex', flexDirection: 'column', 
                  borderRadius: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.07)',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': { transform: 'scale(1.03)', boxShadow: 8, }
                }}
              >
                <CardActionArea
                  onClick={() => handleAddItem(item)}
                  sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1,}}
                >
                  <Box sx={{ height: 140, p: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', }}>
                    <CardMedia
                      component="img"
                      sx={{ maxHeight: '100%', width: 'auto', objectFit: 'contain', borderRadius: 2,}}
                      image={item.imageUrl || 'https://via.placeholder.com/200x130?text=Sem+Imagem'}
                      alt={item.name}
                    />
                  </Box>
                  <CardContent
                    sx={{
                      textAlign: 'center', p: 1, pt: 0.5, flexGrow: 1,
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                    }}
                  >
                    <Typography
                      variant="subtitle2" component="div"
                      sx={{
                        fontWeight: 600,
                        lineHeight: 1.3,
                        height: '3em', 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis', // Adiciona "..."
                        display: '-webkit-box',
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical',
                        mb: 0.5,
                        wordBreak: 'break-word',
                        textAlign: 'center'
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography variant="body1" color="secondary.main" sx={{ fontWeight: 'bold', mt:'auto', flexShrink: 0 }}>
                      R$ {item.price.toFixed(2)}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* === COLUNA DIREITA === */}
      <Paper
        elevation={3}
        sx={{ width: 360, flexShrink: 0, p: 1.5, display: 'flex', flexDirection: 'column', bgcolor: 'background.rightMenu', color: 'primary.contrastText' }}
      >
       
        <Box sx={{ borderBottom: 1, borderColor: '#ffffff', mb: 2 }}>
            <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)} aria-label="summary tabs" textColor="primary" indicatorColor="primary" variant="fullWidth" >
                <Tab label="Pedido Atual" value="current" icon={<ReceiptLongIcon />} iconPosition="start" sx={{minWidth: '50%', color:'secondary.contrastText'}}/>
                <Tab label={`Prontos (${readyOrders.length})`} value="ready" icon={<CheckCircleOutlineIcon />} iconPosition="start" sx={{minWidth: '50%', color:'secondary.contrastText'}}/>
            </Tabs>
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            {activeTab === 'current' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <TextField
                  label="Nome do Cliente" variant="filled" size="small"
                  value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                  fullWidth
                  sx={{ mb: 1.5, bgcolor: 'grey.500', borderRadius: 1, '& .MuiInputBase-input': { color: 'secondary.contrastText' }, '& label': { color: 'secondary.contrastText' }, '& label.Mui-focused': { color: 'primary' } }}
                />
                <List sx={{ flexGrow: 1, overflowY: 'auto', mb: 1.5, p:0}}>
                  {currentOrder.length === 0 ? ( <Typography sx={{ textAlign: 'center', color: 'grey.500', mt: 2 }}>Pedido vazio.</Typography> ) : (
                    currentOrder.map((item, index) => (
                      <ListItem key={item.orderItemId || index} secondaryAction={ <IconButton edge="end" size="small" onClick={() => handleRemoveItem(index)} sx={{ color: 'error.light' }}> <DeleteIcon fontSize="small"/> </IconButton> } disablePadding sx={{ borderBottom: '1px solid #ffffff', pt: 0.5, pb: 0.5 }} >
                        <ListItemAvatar sx={{ minWidth: 48 }}> <Avatar variant="rounded" src={item.imageUrl || 'https://via.placeholder.com/40?text=IMG'} alt={item.name} sx={{ width: 40, height: 40 }}/> </ListItemAvatar>
                        <ListItemText primary={item.name} secondary={`R$ ${item.price.toFixed(2)}`} primaryTypographyProps={{ sx: { color: 'secondary.contrastText', fontSize: '0.9rem', fontWeight: 500 } }} secondaryTypographyProps={{ sx: { color: '#efa337', fontSize: '1rem' } }} />
                      </ListItem>
                    ))
                  )}
                </List>
                <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid grey.700' }}>
                  <Typography variant="h6" component="p" sx={{ textAlign: 'right', mb: 1.5 }}> Total: R$ {total.toFixed(2)} </Typography>
                  <Button variant="contained" color="success" fullWidth startIcon={<SendIcon />} onClick={handleSendOrder} disabled={sendingOrder} sx={{ p: 1.2, fontSize: '1rem', fontWeight: 'bold' }}> {sendingOrder ? 'Enviando...' : 'Enviar Pedido'} </Button>
                </Box>
              </Box>
            )}
            {activeTab === 'ready' && (
               <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {loadingReadyOrders && <Typography sx={{textAlign: 'center', mt: 2}}>Carregando...</Typography>}
                  {errorReadyOrders && <Typography color="error" sx={{textAlign: 'center', mt: 2}}>{errorReadyOrders}</Typography>}
                  {!loadingReadyOrders && readyOrders.length === 0 && !errorReadyOrders ? ( <Typography sx={{ textAlign: 'center', color: 'grey.500', mt: 2 }}>Nenhum pedido pronto.</Typography> ) : (
                    <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
                      {readyOrders.map(order => (
                        <ListItem key={order._id} sx={{ bgcolor: 'background.default', mb: 1, borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: 'column' }}>
                          <Box sx={{ width: '100%', mb:1 }}>
                             <Typography variant="subtitle1">Cliente: {order.clientName}</Typography>
                             <Typography variant="caption" sx={{ color: 'grey.700' }}>ID: #{order._id.slice(-4)} | Garçom: {order.waiterId?.name || 'N/A'}</Typography>
                              <List disablePadding sx={{pl: 1, fontSize: '0.85rem'}}>
                                 {order.items.map((item, idx) => <ListItemText key={idx} primary={`- ${item.name}`} sx={{m:0, p:0}} primaryTypographyProps={{fontSize: '0.9rem'}} />)}
                              </List>
                          </Box>
                           <Button variant="contained" size="small" color="primary" startIcon={<DeliveryDiningIcon />} onClick={() => handleMarkAsDelivered(order._id)} fullWidth > Marcar Entregue </Button>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
            )}
        </Box>
      </Paper>

      {/* Modal de Customização (AINDA NÃO REFATORADO) */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedItem}
        onAddToCart={handleAddToCart}
      />
    </Box> 
  );
}

export default Order;