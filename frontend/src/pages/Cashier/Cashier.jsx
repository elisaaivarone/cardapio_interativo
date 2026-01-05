import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Box, Typography, Button, TextField, Grid, Card, CardContent, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';

// Ícones
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PixIcon from '@mui/icons-material/QrCode';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LockIcon from '@mui/icons-material/Lock';

import AppSidebar from '../../components/AppSidebar/AppSidebar';
import { getCashierStatus, openCashier, closeCashier, addTransaction, getTransactions } from '../../services/api';

const StatCard = ({ title, value, color, icon }) => (
  <Card sx={{ height: '100%', borderLeft: `5px solid ${color}`, boxShadow: 2 }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
            <Typography color="textSecondary" variant="caption" fontWeight="bold" textTransform="uppercase">{title}</Typography>
            <Typography variant="h5" fontWeight="bold">R$ {value.toFixed(2)}</Typography>
        </Box>
        <Box sx={{ color: color, opacity: 0.8 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

const Cashier = () => {
  const [loading, setLoading] = useState(true);
  const [cashierData, setCashierData] = useState(null); 
  const [transactions, setTransactions] = useState([]); 
  const [user, setUser] = useState(null);

  // Estados de Input
  const [initialBalance, setInitialBalance] = useState('');
  const [finalBalance, setFinalBalance] = useState('');
  
  // Estados de Modais
  const [isBleedModalOpen, setIsBleedModalOpen] = useState(false);
  const [bleedValue, setBleedValue] = useState('');
  const [bleedDesc, setBleedDesc] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const status = await getCashierStatus();
      setCashierData(status.isOpen ? status.cashier : null);
      if (status.isOpen) fetchTransactions();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
        const data = await getTransactions();
        setTransactions(data);
    } catch (error) { 
        console.error(error); }
  };

  const handleOpenCashier = async () => {
    if (!initialBalance) return toast.warning('Informe o fundo de troco.');
    try {
      await openCashier(initialBalance);
      toast.success('Caixa aberto com sucesso!');
      fetchStatus();
    } catch (error) {
        console.error(error);
        toast.error('Erro ao abrir caixa.');
    }
  };

  const handleCloseCashier = async () => {
    if (!finalBalance) return toast.warning('Informe o valor final em gaveta.');
    try {
      const result = await closeCashier(finalBalance);
      toast.success(`Caixa fechado! Diferença: R$ ${result.summary.difference.toFixed(2)}`);
      setCashierData(null); 
      setTransactions([]);
    } catch (error) {
        console.error(error);
        toast.error('Erro ao fechar caixa.');
    }
  };

  const handleTransaction = async (type) => {
    if (!bleedValue || !bleedDesc) return toast.warning('Preencha valor e descrição.');
    try {
        await addTransaction(type, bleedDesc, bleedValue);
        toast.success(type === 'bleed' ? 'Sangria realizada!' : 'Suprimento realizado!');
        setIsBleedModalOpen(false);
        setBleedValue('');
        setBleedDesc('');
        fetchTransactions(); 
    } catch (error) {
        console.error(error);
        toast.error('Erro ao registrar transação.');
    }
  };

  // --- RENDERIZAÇÃO ---

  if (loading) return <Typography sx={{p:4}}>Carregando financeiro...</Typography>;

  return (
    <AppSidebar user={user} onLogout={() => {localStorage.clear(); window.location.href='/login'}}>
      <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
        
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PointOfSaleIcon fontSize="large" color="primary"/> 
            Gestão Financeira
            {cashierData && <Typography variant="subtitle1" sx={{bgcolor:'success.light', color:'success.contrastText', px:1, borderRadius:1}}>CAIXA ABERTO</Typography>}
        </Typography>
        
        <Divider sx={{ mb: 4 }} />

        {/* --- CENÁRIO 1: CAIXA FECHADO --- */}
        {!cashierData ? (
          <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4, p: 2, textAlign: 'center' }}>
            <CardContent>
                <LockIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" gutterBottom>O Caixa está Fechado</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Para começar as vendas do dia, informe o valor que está na gaveta (Fundo de Troco).
                </Typography>
                
                <TextField 
                    label="Fundo de Troco (R$)" 
                    type="number" 
                    fullWidth 
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    sx={{ mb: 3, mt: 2 }}
                />
                
                <Button variant="contained" size="large" fullWidth onClick={handleOpenCashier}>
                    ABRIR CAIXA
                </Button>
            </CardContent>
          </Card>
        ) : (
        
        /* --- CENÁRIO 2: CAIXA ABERTO (DASHBOARD) --- */
          <Grid container spacing={3}>
             {/* Note: Aqui você mostraria dados em tempo real. Como o backend calcula o total no /close, 
                 para mostrar em tempo real precisaríamos de uma rota /dashboard-info ou calcular no front com base nas orders. 
                 Por simplicidade, vamos focar nas ações operacionais agora. */}
             
             <Grid item xs={12}>
                 <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Button variant="outlined" color="error" startIcon={<TrendingDownIcon/>} onClick={() => setIsBleedModalOpen(true)}>
                        Realizar Sangria
                    </Button>
                    <Button variant="outlined" color="success" startIcon={<TrendingUpIcon/>} onClick={() => {/* Lógica Suprimento */}}>
                        Suprimento
                    </Button>
                 </Box>
             </Grid>

             {/* Histórico de Transações do Dia */}
             <Grid item xs={12} md={8}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Movimentações de Gaveta</Typography>
                        {transactions.length === 0 ? <Typography variant="body2" color="text.secondary">Nenhuma movimentação extra hoje.</Typography> : (
                            <List>
                                {transactions.map(t => (
                                    <ListItem key={t._id} divider>
                                        <ListItemIcon>
                                            {t.type === 'bleed' ? <TrendingDownIcon color="error"/> : <TrendingUpIcon color="success"/>}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={t.type === 'bleed' ? 'Sangria (Saída)' : 'Suprimento (Entrada)'} 
                                            secondary={`${t.description} - ${new Date(t.date).toLocaleTimeString()}`} 
                                        />
                                        <Typography fontWeight="bold" color={t.type === 'bleed' ? 'error.main' : 'success.main'}>
                                            R$ {t.value.toFixed(2)}
                                        </Typography>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </CardContent>
                </Card>
             </Grid>

             {/* Área de Fechamento */}
             <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'grey.100' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Fechar o Dia</Typography>
                        <Typography variant="body2" paragraph>
                            Conte o dinheiro físico na gaveta e informe abaixo para conferência.
                        </Typography>
                        <TextField 
                            label="Valor na Gaveta (R$)" 
                            type="number" 
                            fullWidth 
                            value={finalBalance}
                            onChange={(e) => setFinalBalance(e.target.value)}
                            sx={{ mb: 2, bgcolor: 'white' }}
                        />
                        <Button variant="contained" color="error" fullWidth onClick={handleCloseCashier}>
                            ENCERRAR E FECHAR CAIXA
                        </Button>
                    </CardContent>
                </Card>
             </Grid>

          </Grid>
        )}

        {/* Modal de Sangria */}
        <Dialog open={isBleedModalOpen} onClose={() => setIsBleedModalOpen(false)}>
            <DialogTitle>Realizar Sangria (Retirada)</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" paragraph>Retirada de dinheiro da gaveta para pagamentos ou cofre.</Typography>
                <TextField label="Valor (R$)" type="number" fullWidth sx={{mb:2, mt:1}} value={bleedValue} onChange={e => setBleedValue(e.target.value)} />
                <TextField label="Motivo / Descrição" fullWidth value={bleedDesc} onChange={e => setBleedDesc(e.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setIsBleedModalOpen(false)}>Cancelar</Button>
                <Button onClick={() => handleTransaction('bleed')} variant="contained" color="error">Confirmar Retirada</Button>
            </DialogActions>
        </Dialog>

      </Box>
    </AppSidebar>
  );
};

export default Cashier;