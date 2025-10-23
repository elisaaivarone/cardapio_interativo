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
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
// Ícones
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import CoffeeIcon from '@mui/icons-material/Coffee';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining'; // Importado para uso futuro na aba 'ready'
// -------------------------

import { getItems, createOrder, getOrders, updateOrderStatus } from '../../services/api';
import ProductModal from '../../components/ProductModal/ProductModal'; 


function Order() {
  const navigate = useNavigate();
  const [menuType, setMenuType] = useState('allDay'); 
  const [currentOrder, setCurrentOrder] = useState([]); 
  const [customerName, setCustomerName] = useState(''); 

  // Estados para os produtos carregados da API
  const [breakfastItems, setBreakfastItems] = useState([]);
  const [allDayItems, setAllDayItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  // Estados para o modal de customização
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Estado para o envio do pedido
  const [sendingOrder, setSendingOrder] = useState(false);

  // Estados para a aba "Pedidos Prontos"
  const [activeTab, setActiveTab] = useState('current');
  const [readyOrders, setReadyOrders] = useState([]);
  const [loadingReadyOrders, setLoadingReadyOrders] = useState(false);
  const [errorReadyOrders, setErrorReadyOrders] = useState('');

  // useEffect para buscar os MENUS
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

  // useEffect para buscar os PEDIDOS PRONTOS
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
      const intervalId = setInterval(fetchReadyOrders, 30000); 
      return () => clearInterval(intervalId); 
    }
  }, [activeTab]);

 
  const menuToDisplay = menuType === 'breakfast' ? breakfastItems : allDayItems;


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

  // Adiciona item ao carrinho
  const handleAddToCart = (item) => {
    setCurrentOrder([...currentOrder, item]);
  };

  // Remove item do carrinho
  const handleRemoveItem = (indexToRemove) => {
    const newOrder = currentOrder.filter((_, index) => index !== indexToRemove);
    setCurrentOrder(newOrder);
  };
  
  // Envia o pedido para a API
  const handleSendOrder = async () => {
    if (currentOrder.length === 0) {
      toast.warn('O pedido está vazio!');
      return;
    }
    if (!customerName.trim()) {
      toast.warn('Por favor, insira o nome do cliente.');
      return;
    }

    setSendingOrder(true); 
    const orderData = {
      clientName: customerName.trim(),
      items: currentOrder.map(item => ({
        productId: item._id, 
        name: item.name, 
        price: item.price 
      })),
      totalPrice: total
    };

    try {
      const createdOrder = await createOrder(orderData);
      console.log('Pedido criado com sucesso:', createdOrder);
      toast.success(`Pedido para ${customerName} enviado!`);
      setCurrentOrder([]);
      setCustomerName('');
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      toast.error('Não foi possível enviar o pedido.');
    } finally {
      setSendingOrder(false); 
    }
  };

  // Função de Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Marca um pedido como entregue (será usado na aba 'ready')
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

  // Calcula o total do pedido atual
  const total = currentOrder.reduce((sum, item) => sum + item.price, 0);

  
  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f4f6f8' }}> 
      
      {/* SEÇÃO DO MENU (LADO ESQUERDO) */}
      <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', bgcolor: 'white', borderRight: '1px solid #e0e0e0' }}> 
        {/* Abas para trocar de menu */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={menuType} 
            onChange={(event, newValue) => setMenuType(newValue)} 
            aria-label="menu tabs"
            variant="fullWidth"
          >
            <Tab label="Almoço / Jantar" value="allDay" icon={<FastfoodIcon />} iconPosition="start" />
            <Tab label="Café da Manhã" value="breakfast" icon={<CoffeeIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Grid de Produtos */}
        {loadingMenu ? (
          <Typography sx={{ textAlign: 'center', mt: 4, width: '100%'}}>Carregando produtos...</Typography>
        ) : (
          <Grid container spacing={2}> 
            {menuToDisplay.map(item => (
              <Grid item key={item._id} xs={6} sm={4} md={3} lg={2} sx={{ display: 'flex' }}> 
                <Card sx={{ 
                  width: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': { 
                    transform: 'scale(1.03)',
                    boxShadow: 6
                    }
                  }}> 
                  <CardActionArea 
                    onClick={() => handleAddItem(item)} 
                    sx={{ 
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                    }}> 
                    <CardMedia
                      component="img"
                      height="120" 
                      image={item.imageUrl || 'https://via.placeholder.com/200x120?text=Sem+Imagem'}
                      alt={item.name}
                      sx={{objectFit: 'cover'}}                    />
                    <CardContent 
                      sx={{ 
                        textAlign: 'center',
                        flexGrow: 1,
                        p: 1, 
                        display: 'flex', 
                        flexDirection:'column',
                        justifyContent: 'space-between',
                        width: '100%'
                      }}> 
                      <Typography gutterBottom variant="subtitle1" component="div" 
                        sx={{ 
                          fontSize: '0.9rem',
                          lineHeight: 1.3,
                          fontWeight: '600',
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2, // << LIMITA A 2 LINHAS
                          WebkitBoxOrient: 'vertical',
                          minHeight: 'calc(1.3em * 2)', 
                        }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mt: 'auto' }}>
                        R$ {item.price.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* SEÇÃO DO RESUMO (LADO DIREITO) */}
      <Box sx={{ 
        width: '380px', 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: '#303030', 
        color: 'white' 
      }}>
        
        {/* CABEÇALHO DO RESUMO */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5" component="h2"> 
             {activeTab === 'current' ? 'Pedido Atual' : 'Pedidos Prontos'}
          </Typography>
          <Button 
            variant="contained" 
            color="error" 
            size="small" 
            startIcon={<LogoutIcon />} 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>

        {/* ABAS DE NAVEGAÇÃO DO RESUMO */}
        <Box sx={{ borderBottom: 1, borderColor: 'grey.700', mb: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={(event, newValue) => setActiveTab(newValue)}
            aria-label="summary tabs"
            textColor="inherit" 
            indicatorColor="primary" 
            variant="fullWidth" 
          >
            <Tab label="Pedido Atual" value="current" icon={<ReceiptLongIcon />} iconPosition="start" sx={{minWidth: '50%'}}/>
            <Tab label={`Prontos (${readyOrders.length})`} value="ready" icon={<CheckCircleOutlineIcon />} iconPosition="start" sx={{minWidth: '50%'}}/>
          </Tabs>
        </Box>

        {/* CONTEÚDO DAS ABAS */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}> 
          
          {/* CONTEÚDO ABA PEDIDO ATUAL */}
          {activeTab === 'current' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <TextField
                label="Nome do Cliente"
                variant="outlined"
                size="small" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                sx={{ mb: 2, input: { color: 'white' }, label: { color: 'grey.400' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'grey.600' }, '&:hover fieldset': { borderColor: 'grey.400' }, '&.Mui-focused fieldset': { borderColor: 'primary.main' } } }} 
              />

              <List sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, p: 0 }}> 
                {currentOrder.length === 0 ? (
                  <Typography sx={{ textAlign: 'center', color: 'grey.500', mt: 2 }}>Pedido vazio.</Typography>
                ) : (
                  currentOrder.map((item, index) => (
                    <ListItem 
                      key={item.orderItemId || index}
                      secondaryAction={ 
                        <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveItem(index)} sx={{ color: 'error.light' }}>
                          <DeleteIcon fontSize="small"/>
                        </IconButton>
                      }
                      disablePadding 
                      sx={{ borderBottom: '1px dashed grey' }}
                    >
                      <ListItemText 
                        primary={item.name} 
                        secondary={`R$ ${item.price.toFixed(2)}`} 
                        primaryTypographyProps={{ sx: { color: 'white', fontSize: '0.95rem' } }}
                        secondaryTypographyProps={{ sx: { color: 'grey.400', fontSize: '0.85rem' } }}
                      />
                    </ListItem>
                  ))
                )}
              </List>

              <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid grey.700' }}> 
                <Typography variant="h6" component="p" sx={{ textAlign: 'right', mb: 1 }}>
                  Total: R$ {total.toFixed(2)}
                </Typography>
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth 
                  startIcon={<SendIcon />}
                  onClick={handleSendOrder}
                  disabled={sendingOrder}
                  sx={{ p: 1.5, fontSize: '1rem' }} 
                >
                  {sendingOrder ? 'Enviando...' : 'Enviar para Cozinha'}
                </Button>
              </Box>
            </Box>
          )}

          {/* CONTEÚDO ABA PEDIDOS PRONTOS (PLACEHOLDER POR ENQUANTO) */}
          {activeTab === 'ready' && (
             <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {loadingReadyOrders && <Typography sx={{textAlign: 'center', mt: 2}}>Carregando...</Typography>}
                {errorReadyOrders && <Typography color="error" sx={{textAlign: 'center', mt: 2}}>{errorReadyOrders}</Typography>}
                
                {!loadingReadyOrders && readyOrders.length === 0 && !errorReadyOrders ? (
                  <Typography sx={{ textAlign: 'center', color: 'grey.500', mt: 2 }}>Nenhum pedido pronto.</Typography>
                ) : (
                  <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
                    {readyOrders.map(order => (
                      <ListItem 
                        key={order._id} 
                        sx={{ bgcolor: 'grey.800', mb: 1, borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: 'column' }}
                      >
                        <Box sx={{ width: '100%', mb:1 }}>
                           <Typography variant="subtitle1">Cliente: {order.clientName}</Typography>
                           <Typography variant="caption" sx={{ color: 'grey.400' }}>ID: #{order._id.slice(-4)} | Garçom: {order.waiterId?.name || 'N/A'}</Typography>
                            <List disablePadding sx={{pl: 1, fontSize: '0.85rem'}}>
                               {order.items.map((item, idx) => <ListItemText key={idx} primary={`- ${item.name}`} sx={{m:0, p:0}} primaryTypographyProps={{fontSize: '0.9rem'}} />)}
                            </List>
                        </Box>
                         <Button 
                           variant="contained" 
                           size="small"
                           color="info" 
                           startIcon={<DeliveryDiningIcon />}
                           onClick={() => handleMarkAsDelivered(order._id)}
                           fullWidth
                         >
                           Marcar Entregue
                         </Button>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
          )}
        </Box> 
      </Box> 
      
      {/* Modal de Customização (ainda precisa ser refatorado com MUI se desejar) */}
      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedItem}
        onAddToCart={handleAddToCart}
      />
    </Box> // 
  );
}

export default Order;