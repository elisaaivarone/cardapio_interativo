import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getOrders, updateOrderStatus } from "../../services/api";

// --- IMPORTAÇÕES DO MUI ---
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
// Ícones
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function Kitchen() {
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const orders= await getOrders('pending');
      setPendingOrders(orders);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      setError('Erro ao buscar pedidos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    } 
  };  

  useEffect(() => {
    fetchPendingOrders();
    const intervalId = setInterval(fetchPendingOrders, 30000);
    return () => clearInterval(intervalId); 
  }, []);

  // Função para marcar um pedido como "ready"
  const handleMarkAsReady = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'ready');
      setPendingOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
    } catch (error) {
      console.error("Erro ao atualizar status do pedido:", error);
      toast.error('Erro ao atualizar status do pedido. Tente novamente.');
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Função para calcular o tempo decorrido desde a criação do pedido
  const calculateTimeElapsed = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created; // Diferença em milissegundos
    const diffMins = Math.floor(diffMs / 60000); // Converte para minutos
    return `${diffMins} minutos`; 
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Cozinha - Pedidos Pendentes
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress size={60} />
          </Box>
        )}
        {error && <Typography color="error" sx={{ textAlign: 'center', mt: 3 }}>{error}</Typography>}

      {/* Grid de Pedidos */}
        {!loading && (
          <>
            {pendingOrders.length === 0 && !error ? (
              <Typography sx={{ textAlign: 'center', mt: 5, fontSize: '1.2rem', color: 'text.secondary' }}>
                Nenhum pedido pendente no momento.
              </Typography>
        ) : (
          <Grid container spacing={3}>
            {pendingOrders.map(order => (
              <Grid key={order._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    boxShadow: 3, 
                    borderRadius: 2 
                  }}>

                  {/* Conteúdo do Card */}
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>

                  {/* Cabeçalho do Card */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, borderBottom: '1px solid #eee', pb: 1 }}>
                      <Typography variant="h6" component="h3" color="primary">
                        Pedido #{order._id.slice(-6)} 
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <AccessTimeIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {calculateTimeElapsed(order.createdAt)}
                          </Typography>
                      </Box>
                    </Box>

                    {/* Detalhes do Pedido */}
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Cliente: {order.clientName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Garçom: {order.waiterId?.name || 'N/A'}
                    </Typography>

                  {/* Lista de Itens */}
                    <List dense disablePadding sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 150, mb: 1.5, border: '1px solid #eee', borderRadius: 1, p: 1 }}>
                      {order.items.map((item, index) => (
                        <ListItemText 
                          key={index} 
                          primary={`- ${item.name}`} 
                          primaryTypographyProps={{ sx: { fontSize: '0.95rem' } }}
                        />
                      ))}
                    </List>
                  </CardContent>

                  {/* Ação (Botão) */}
                  <CardActions sx={{ mt: 'auto', p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleMarkAsReady(order._id)}
                      sx={{ fontWeight: 'bold' }}
                    >
                      Marcar como Pronto
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </>
     )}
    </Container>
  </Box>
  );
}

export default Kitchen;