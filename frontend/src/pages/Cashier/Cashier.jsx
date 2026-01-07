// src/pages/Cashier/Cashier.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  Box, Typography, Button, TextField, Paper, Divider, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Chip, CircularProgress, Card, CardContent, Grid
} from '@mui/material';

// Bibliotecas Externas
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

// Ícones
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import LockIcon from '@mui/icons-material/Lock';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

import AppSidebar from '../../components/AppSidebar/AppSidebar';
import { getCashierStatus, openCashier, closeCashier, getOrders } from '../../services/api';

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Cashier = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const [cashierData, setCashierData] = useState(null);
  const [todaysOrders, setTodaysOrders] = useState([]);
  const [salesSummary, setSalesSummary] = useState({ credit: 0, debit: 0, pix: 0, cash: 0, total: 0 });
  
  const [initialBalance, setInitialBalance] = useState('');
  const [cashTroco, setCashTroco] = useState('');
  const [cashRetirada, setCashRetirada] = useState('');
  const [observations, setObservations] = useState('');

  // Dados do gráfico
  const chartData = useMemo(() => [
    { name: 'Crédito', value: salesSummary.credit },
    { name: 'Débito', value: salesSummary.debit },
    { name: 'Pix', value: salesSummary.pix },
    { name: 'Dinheiro', value: salesSummary.cash },
  ].filter(item => item.value > 0), [salesSummary]);

  const calculateSales = (orders) => {
    const summary = { credit: 0, debit: 0, pix: 0, cash: 0, total: 0 };
    orders.forEach(order => {
      const val = order.totalPrice;
      if (order.paymentMethod === 'credit') summary.credit += val;
      if (order.paymentMethod === 'debit') summary.debit += val;
      if (order.paymentMethod === 'pix') summary.pix += val;
      if (order.paymentMethod === 'cash') summary.cash += val;
      summary.total += val;
    });
    setSalesSummary(summary);
  };

  const fetchCashierStatus = useCallback(async () => {
    try {
      const status = await getCashierStatus();
      if (status.isOpen) {
        setCashierData(status.cashier);
        const allOrders = await getOrders('paid'); 
        const openTime = new Date(status.cashier.openedAt).getTime();
        const currentSessionOrders = allOrders.filter(o => new Date(o.createdAt).getTime() >= openTime);
        
        setTodaysOrders(currentSessionOrders);
        calculateSales(currentSessionOrders);
      } else {
        setCashierData(null);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        await fetchCashierStatus();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchCashierStatus]);

  const handleOpenCashier = async () => {
    if (!initialBalance) return toast.warning('Informe o fundo de troco.');
    try {
      await openCashier(initialBalance);
      toast.success('Caixa aberto!');
      fetchCashierStatus();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao abrir.');
    }
  };

  const handleCloseCashier = async () => {
    const totalCashNet = salesSummary.cash - (parseFloat(cashTroco)||0) - (parseFloat(cashRetirada)||0);
    const finalBalanceCalc = cashierData.initialBalance + totalCashNet;

    try {
      await closeCashier(finalBalanceCalc);
      toast.success('Caixa fechado com sucesso!');
      setCashierData(null);
      setTodaysOrders([]);
      setCashTroco('');
      setCashRetirada('');
      setObservations('');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao fechar.');
    }
  };

  const getNetTotal = (systemValue, troco = 0, retirada = 0) => {
    return systemValue - troco - retirada;
  };

  const totalGeral = 
    salesSummary.credit + 
    salesSummary.debit + 
    salesSummary.pix + 
    getNetTotal(salesSummary.cash, parseFloat(cashTroco)||0, parseFloat(cashRetirada)||0);

  if (loading) return <Box sx={{display:'flex', justifyContent:'center', mt:10}}><CircularProgress /></Box>;

  // --- TELA DE ABERTURA ---
  if (!cashierData) {
    return (
      <AppSidebar user={user}>
          <Box sx={{ maxWidth: 400, mx: 'auto', mt: 10, textAlign: 'center' }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <LockIcon sx={{ fontSize: 50, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>Caixa Fechado</Typography>
                <TextField 
                    label="Fundo de Troco (R$)" type="number" fullWidth variant="outlined"
                    value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)}
                    sx={{ mb: 3, mt: 2 }}
                />
                <Button variant="contained" color="primary" size="large" fullWidth onClick={handleOpenCashier}>
                    ABRIR CAIXA
                </Button>
            </Paper>
          </Box>
      </AppSidebar>
    );
  }

  // --- TELA PRINCIPAL ---
  return (
    <AppSidebar user={user} onLogout={() => {localStorage.clear(); window.location.href='/login'}}>
      <Box sx={{ p: 3, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
        
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
             <Box>
                <Typography variant="h4" fontWeight="bold" sx={{color:'#333'}}>Financeiro</Typography>
                <Chip label="Caixa Aberto" color="success" size="small" icon={<PointOfSaleIcon/>} sx={{mt:0.5}} />
             </Box>
        </Box>

        {/* Abas */}
        <Paper sx={{ mb: 3, borderRadius: 2 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} indicatorColor="primary" textColor="primary">
                <Tab label="Fechamento de Caixa" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
                <Tab label="Entradas de Hoje" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
            </Tabs>
        </Paper>

        {activeTab === 0 && (
            <Box>
                {/* 1. SEÇÃO DE CARDS (TOPO) - FULL WIDTH */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Card sx={{ flex: 1, minWidth: 250, boxShadow: 1 }}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">ABERTURA (FUNDO)</Typography>
                                <Typography variant="h5" fontWeight="bold">R$ {cashierData.initialBalance.toFixed(2)}</Typography>
                            </Box>
                            <LockIcon sx={{ color: 'text.secondary', opacity: 0.3, fontSize: 40 }} />
                        </CardContent>
                    </Card>
                    <Card sx={{ flex: 1, minWidth: 250, boxShadow: 1 }}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">VENDAS TOTAIS</Typography>
                                <Typography variant="h5" fontWeight="bold" color="primary.main">R$ {salesSummary.total.toFixed(2)}</Typography>
                            </Box>
                            <MonetizationOnIcon sx={{ color: 'primary.main', opacity: 0.3, fontSize: 40 }} />
                        </CardContent>
                    </Card>
                </Box>

                {/* 2. SEÇÃO DA TABELA (MEIO) - DESTAQUE TOTAL */}
                <Paper sx={{ p: 3, borderRadius: 2, mb: 3, boxShadow: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Conferência de Valores</Typography>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: '#f1f1f1' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Forma de Pagamento</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Pago (Sistema)</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Troco</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Retirada / Devolução</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total Líquido</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* Cartão de Crédito */}
                                <TableRow>
                                    <TableCell sx={{ py: 2 }}>Cartão de Crédito</TableCell>
                                    <TableCell align="center" sx={{ py: 2 }}>R$ {salesSummary.credit.toFixed(2)}</TableCell>
                                    <TableCell align="center" sx={{ color: 'text.disabled' }}>-</TableCell>
                                    <TableCell align="center" sx={{ color: 'text.disabled' }}>-</TableCell>
                                    <TableCell align="right" fontWeight="bold" sx={{ fontSize: '1rem' }}>R$ {salesSummary.credit.toFixed(2)}</TableCell>
                                </TableRow>

                                {/* Cartão de Débito */}
                                <TableRow>
                                    <TableCell sx={{ py: 2 }}>Cartão de Débito</TableCell>
                                    <TableCell align="center" sx={{ py: 2 }}>R$ {salesSummary.debit.toFixed(2)}</TableCell>
                                    <TableCell align="center" sx={{ color: 'text.disabled' }}>-</TableCell>
                                    <TableCell align="center" sx={{ color: 'text.disabled' }}>-</TableCell>
                                    <TableCell align="right" fontWeight="bold" sx={{ fontSize: '1rem' }}>R$ {salesSummary.debit.toFixed(2)}</TableCell>
                                </TableRow>

                                {/* Pix */}
                                <TableRow>
                                    <TableCell sx={{ py: 2 }}>Pix</TableCell>
                                    <TableCell align="center" sx={{ py: 2 }}>R$ {salesSummary.pix.toFixed(2)}</TableCell>
                                    <TableCell align="center" sx={{ color: 'text.disabled' }}>-</TableCell>
                                    <TableCell align="center" sx={{ color: 'text.disabled' }}>-</TableCell>
                                    <TableCell align="right" fontWeight="bold" sx={{ fontSize: '1rem' }}>R$ {salesSummary.pix.toFixed(2)}</TableCell>
                                </TableRow>

                                {/* Dinheiro (Destaque) */}
                                <TableRow sx={{ bgcolor: '#fffde7' }}>
                                    <TableCell sx={{ py: 2 }}><strong>Dinheiro</strong></TableCell>
                                    <TableCell align="center" sx={{ py: 2 }}>
                                        <strong>R$ {salesSummary.cash.toFixed(2)}</strong>
                                    </TableCell>
                                    <TableCell align="center">
                                        <TextField 
                                            size="small" type="number" placeholder="R$ 0.00" 
                                            value={cashTroco} onChange={e => setCashTroco(e.target.value)}
                                            sx={{ bgcolor: 'white', width: 140 }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <TextField 
                                            size="small" type="number" placeholder="R$ 0.00" 
                                            value={cashRetirada} onChange={e => setCashRetirada(e.target.value)}
                                            sx={{ bgcolor: 'white', width: 140 }}
                                        />
                                    </TableCell>
                                    <TableCell align="right" fontWeight="bold" sx={{ fontSize: '1.1rem', color: 'primary.main' }}>
                                        R$ {getNetTotal(salesSummary.cash, parseFloat(cashTroco)||0, parseFloat(cashRetirada)||0).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                                
                                {/* Total Geral */}
                                <TableRow sx={{ bgcolor: '#e0e0e0', borderTop: '2px solid #bdbdbd' }}>
                                    <TableCell sx={{ py: 3, fontSize: '1.2rem' }}><strong>TOTAL GERAL</strong></TableCell>
                                    <TableCell align="center" colSpan={3}></TableCell>
                                    <TableCell align="right">
                                        <Chip label={`R$ ${totalGeral.toFixed(2)}`} color="success" sx={{ fontWeight: 'bold', fontSize: '1.2rem', height: 40, px: 2 }} />
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* 3. SEÇÃO INFERIOR: GRÁFICO E OBSERVAÇÕES */}
                <Grid container spacing={3}>
                    {/* Gráfico */}
                    <Grid item xs={12} md={5}>
                         <Paper sx={{ p: 3, height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 2 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>Distribuição de Vendas</Typography>
                            {salesSummary.total > 0 ? (
                                <Box sx={{ width: '100%', height: 250 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                                                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                                            </Pie>
                                            <RechartsTooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                                            <Legend verticalAlign="bottom" height={36}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            ) : (
                                <Box sx={{ flexGrow:1, display:'flex', alignItems:'center', color:'text.secondary' }}>Sem dados.</Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Observações e Ação */}
                    <Grid item xs={12} md={7}>
                        <Paper sx={{ p: 3, height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column', boxShadow: 2 }}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>Observações e Fechamento</Typography>
                            <TextField 
                                fullWidth multiline rows={4} 
                                placeholder="Observações do dia (ex: quebra de caixa, sangrias manuais, problemas na operação)..." 
                                variant="outlined"
                                value={observations} onChange={e => setObservations(e.target.value)}
                                sx={{ bgcolor: '#fafafa', mb: 3, flexGrow: 1 }}
                            />
                            <Button 
                                variant="contained" 
                                color="error" 
                                size="large" 
                                startIcon={<ExitToAppIcon />} 
                                onClick={handleCloseCashier}
                                sx={{ py: 2, fontWeight: 'bold', fontSize: '1rem', bgcolor: '#1a1a1a', '&:hover': { bgcolor: 'black' } }}
                            >
                                ENCERRAR DIA E FECHAR CAIXA
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        )}

        {activeTab === 1 && (
            <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                            <TableRow>
                                <TableCell><strong>Pedido ID</strong></TableCell>
                                <TableCell><strong>Hora</strong></TableCell>
                                <TableCell><strong>Valor</strong></TableCell>
                                <TableCell><strong>Pagamento</strong></TableCell>
                                <TableCell><strong>Garçom</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {todaysOrders.map((order) => (
                                <TableRow key={order._id} hover>
                                    <TableCell>#{order._id.slice(-4)}</TableCell>
                                    <TableCell>{new Date(order.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</TableCell>
                                    <TableCell fontWeight="bold">R$ {order.totalPrice.toFixed(2)}</TableCell>
                                    <TableCell><Chip label={order.paymentMethod} size="small" /></TableCell>
                                    <TableCell>{order.waiterId?.name || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        )}

      </Box>
    </AppSidebar>
  );
};

export default Cashier;