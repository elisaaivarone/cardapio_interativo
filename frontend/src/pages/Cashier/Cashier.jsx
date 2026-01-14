import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import currency from 'currency.js';
import {
  Box, Typography, Button, TextField, Paper, Divider, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Chip, CircularProgress, Card, CardContent, Grid,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';

// Gráficos
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

// Ícones
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import LockIcon from '@mui/icons-material/Lock';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PrintIcon from '@mui/icons-material/Print';
import SavingsIcon from '@mui/icons-material/Savings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import DateRangeIcon from '@mui/icons-material/DateRange';

import AppSidebar from '../../components/AppSidebar/AppSidebar';
import { getCashierStatus, openCashier, closeCashier, getOrders, getCashierHistory } from '../../services/api';

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Cashier = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // --- CAIXA ATUAL ---
  const [cashierData, setCashierData] = useState(null);
  const [todaysOrders, setTodaysOrders] = useState([]);
  const [salesSummary, setSalesSummary] = useState({ credit: 0, debit: 0, pix: 0, cash: 0, change: 0, total: 0 });
  const [initialBalance, setInitialBalance] = useState('');
  const [cashRetirada, setCashRetirada] = useState('');
  const [observations, setObservations] = useState('');

  // --- HISTÓRICO ---
  const [historyData, setHistoryData] = useState([]);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyTotals, setHistoryTotals] = useState({ cash: 0, card: 0, pix: 0, total: 0 });

  // --- REFS PARA IMPRESSÃO ---
  const printCurrentRef = useRef(null);
  const printHistoryRef = useRef(null);

  const handlePrintCurrent = useReactToPrint({
    contentRef: printCurrentRef, 
    documentTitle: 'Fechamento_Dia',
    onAfterPrint: () => console.log('Impressão finalizada'),
    onPrintError: () => toast.error('Erro ao imprimir')
  });

  const handlePrintHistory = useReactToPrint({
    contentRef: printHistoryRef, 
    documentTitle: 'Relatorio_Historico',
    onAfterPrint: () => console.log('Impressão finalizada'),
    onPrintError: () => toast.error('Erro ao imprimir')
  });

  // Helper Moeda
  const formatMoney = (value) => currency(value).format({ symbol: 'R$ ', separator: '.', decimal: ',' });

  const chartData = useMemo(() => [
    { name: 'Crédito', value: salesSummary.credit },
    { name: 'Débito', value: salesSummary.debit },
    { name: 'Pix', value: salesSummary.pix },
    { name: 'Dinheiro', value: salesSummary.cash },
  ].filter(item => item.value > 0), [salesSummary]);

  const calculateSales = (orders) => {
    let credit = currency(0);
    let debit = currency(0);
    let pix = currency(0);
    let cash = currency(0);
    let change = currency(0);
    let total = currency(0);
    
    orders.forEach(order => {
      const val = order.totalPrice;
      if (order.paymentMethod === 'credit') credit = credit.add(val);
      else if (order.paymentMethod === 'debit') debit = debit.add(val);
      else if (order.paymentMethod === 'pix') pix = pix.add(val);
      else if (order.paymentMethod === 'cash') {
          cash = cash.add(val);
          if (order.change) change = change.add(order.change);
      }
      total = total.add(val);
    });

    setSalesSummary({
        credit: credit.value,
        debit: debit.value,
        pix: pix.value,
        cash: cash.value,
        change: change.value,
        total: total.value
    });
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

  const fetchHistory = async () => {
    try {
        setLoadingHistory(true);
        const data = await getCashierHistory(dateStart, dateEnd);
        setHistoryData(data);

        let sumCash = currency(0);
        let sumCard = currency(0);
        let sumPix = currency(0);
        let sumTotal = currency(0);

        data.forEach(c => {
            if (c.summary) {
                sumCash = sumCash.add(c.summary.totalSalesCash || 0);
                sumCard = sumCard.add(c.summary.totalSalesCard || 0);
                sumPix = sumPix.add(c.summary.totalSalesPix || 0);
                const dailyTotal = (c.summary.totalSalesCash || 0) + (c.summary.totalSalesCard || 0) + (c.summary.totalSalesPix || 0);
                sumTotal = sumTotal.add(dailyTotal);
            }
        });

        setHistoryTotals({
            cash: sumCash.value,
            card: sumCard.value,
            pix: sumPix.value,
            total: sumTotal.value
        });

    } catch (error) {
        toast.error('Erro ao buscar histórico.');
        console.error("Erro ao buscar dados:", error);
    } finally {
        setLoadingHistory(false);
    }
  };

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

  useEffect(() => {
    if (activeTab === 2) fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleOpenCashier = async () => {
    if (!initialBalance) return toast.warning('Informe o fundo de troco.');
    try {
      await openCashier(initialBalance);
      toast.success('Caixa aberto!');
      fetchCashierStatus();
    } catch (error) {
      toast.error('Erro ao abrir.');
      console.error("Erro ao buscar dados:", error);
    }
  };

  const handleCloseCashier = async () => {
    const totalDrawer = currency(cashierData.initialBalance).add(salesSummary.cash).subtract(cashRetirada || 0).value;
    try {
      await closeCashier(totalDrawer);
      toast.success('Caixa fechado com sucesso!');
      setCashierData(null);
      setTodaysOrders([]);
      setCashRetirada('');
      setObservations('');
    } catch (error) {
      toast.error('Erro ao fechar.');
      console.error("Erro ao buscar dados:", error);
    }
  };

  if (loading) return <Box sx={{display:'flex', justifyContent:'center', mt:10}}><CircularProgress /></Box>;

  // Tela de Abertura
  if (!cashierData && activeTab !== 2) {
    return (
      <AppSidebar user={user}>
          <Box sx={{ maxWidth: 400, mx: 'auto', mt: 10, textAlign: 'center' }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <LockIcon sx={{ fontSize: 50, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>Caixa Fechado</Typography>
                <TextField label="Fundo de Troco (R$)" type="number" fullWidth variant="outlined" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} sx={{ mb: 3, mt: 2 }} />
                <Button variant="contained" color="primary" size="large" fullWidth onClick={handleOpenCashier}>ABRIR CAIXA</Button>
                <Divider sx={{ my: 3 }}>OU</Divider>
                <Button variant="outlined" color="inherit" onClick={() => setActiveTab(2)}>Ver Histórico</Button>
            </Paper>
          </Box>
      </AppSidebar>
    );
  }

  const safeInitialBalance = cashierData ? cashierData.initialBalance : 0;
  const liquidoDinheiro = currency(salesSummary.cash).subtract(cashRetirada || 0).value;
  const totalNaGaveta = currency(safeInitialBalance).add(liquidoDinheiro).value;
  const totalGeralLiquido = currency(salesSummary.credit).add(salesSummary.debit).add(salesSummary.pix).add(liquidoDinheiro).value;

  return (
    <AppSidebar user={user} onLogout={() => {localStorage.clear(); window.location.href='/login'}}>
      <Box sx={{ p: 3, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
             <Box>
                <Typography variant="h4" fontWeight="bold" sx={{color:'#333'}}>Financeiro</Typography>
                {cashierData ? (
                    <Chip label="Caixa Aberto" color="success" size="small" icon={<PointOfSaleIcon/>} sx={{mt:0.5}} />
                ) : (
                    <Chip label="Caixa Fechado" color="default" size="small" icon={<LockIcon/>} sx={{mt:0.5}} />
                )}
             </Box>
          
             {activeTab === 0 && cashierData && (
                 <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => handlePrintCurrent()} sx={{ bgcolor:'white', color:'#555' }}>
                    Imprimir Relatório do Dia
                 </Button>
             )}
        </Box>

        <Paper sx={{ mb: 3, borderRadius: 2 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} indicatorColor="primary" textColor="primary">
                <Tab label="Fechamento de Caixa" disabled={!cashierData} sx={{ textTransform: 'none', fontWeight: 'bold' }} />
                <Tab label="Entradas de Hoje" disabled={!cashierData} sx={{ textTransform: 'none', fontWeight: 'bold' }} />
                <Tab label="Histórico / Relatórios" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
            </Tabs>
        </Paper>

        {/* === ABA 0: FECHAMENTO === */}
        {activeTab === 0 && cashierData && (
            <Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Card sx={{ flex: 1, minWidth: 200, boxShadow: 1, border: '1px solid #ddd' }}>
                        <CardContent><Typography variant="caption" color="text.secondary" fontWeight="bold">ABERTURA</Typography><Typography variant="h5" fontWeight="bold">{formatMoney(cashierData.initialBalance)}</Typography></CardContent>
                    </Card>
                    <Card sx={{ flex: 1, minWidth: 200, boxShadow: 1, border: '1px solid #ddd' }}>
                        <CardContent><Typography variant="caption" color="text.secondary" fontWeight="bold">FATURAMENTO</Typography><Typography variant="h5" fontWeight="bold" color="primary.main">{formatMoney(salesSummary.total)}</Typography></CardContent>
                    </Card>
                    <Card sx={{ flex: 1, minWidth: 200, boxShadow: 1, bgcolor: '#e8f5e9', border: '1px solid #c8e6c9' }}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="caption" color="success.dark" fontWeight="bold">TOTAL GAVETA (FÍSICO)</Typography>
                                <Typography variant="h5" fontWeight="bold" color="success.dark">{formatMoney(totalNaGaveta)}</Typography>
                            </Box>
                            <SavingsIcon sx={{ color: 'success.dark', opacity: 0.5, fontSize: 40 }} />
                        </CardContent>
                    </Card>
                </Box>

                <Paper sx={{ p: 3, borderRadius: 2, mb: 3, boxShadow: 2, border: '1px solid #eee' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Conferência de Valores</Typography>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f1f1f1' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Forma</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Venda</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Troco</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Retirada</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Líquido</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Crédito</TableCell>
                                    <TableCell align="center">{formatMoney(salesSummary.credit)}</TableCell>
                                    <TableCell align="center">-</TableCell>
                                    <TableCell align="center">-</TableCell>
                                    <TableCell align="right">{formatMoney(salesSummary.credit)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Débito</TableCell>
                                    <TableCell align="center">{formatMoney(salesSummary.debit)}</TableCell>
                                    <TableCell align="center">-</TableCell>
                                    <TableCell align="center">-</TableCell>
                                    <TableCell align="right">{formatMoney(salesSummary.debit)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Pix</TableCell>
                                    <TableCell align="center">{formatMoney(salesSummary.pix)}</TableCell>
                                    <TableCell align="center">-</TableCell>
                                    <TableCell align="center">-</TableCell>
                                    <TableCell align="right">{formatMoney(salesSummary.pix)}</TableCell>
                                </TableRow>
                                <TableRow sx={{ bgcolor: '#fffde7' }}>
                                    <TableCell><strong>Dinheiro</strong></TableCell>
                                    <TableCell align="center">{formatMoney(salesSummary.cash)}</TableCell>
                                    <TableCell align="center" sx={{ color: 'error.main' }}>- {formatMoney(salesSummary.change)}</TableCell>
                                    <TableCell align="center">
                                        <TextField size="small" type="number" placeholder="0.00" value={cashRetirada} onChange={e => setCashRetirada(e.target.value)} sx={{ bgcolor: 'white', width: 120 }} />
                                    </TableCell>
                                    <TableCell align="right" fontWeight="bold" sx={{ color: 'primary.main' }}>{formatMoney(liquidoDinheiro)}</TableCell>
                                </TableRow>
                                <TableRow sx={{ bgcolor: '#d7ccc8', borderTop: '2px solid #bdbdbd' }}>
                                    <TableCell><strong>TOTAL GERAL</strong></TableCell>
                                    <TableCell align="center" colSpan={3}></TableCell>
                                    <TableCell align="right"><Chip label={formatMoney(totalGeralLiquido)} color="warning" sx={{ fontWeight: 'bold', fontSize: '1rem' }} /></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                        <Typography variant="subtitle2" color="success.dark">RESUMO GAVETA:</Typography>
                        <Typography variant="body2">Fundo Inicial ({formatMoney(safeInitialBalance)}) + Líquido Dinheiro ({formatMoney(liquidoDinheiro)}) = <strong>{formatMoney(totalNaGaveta)}</strong></Typography>
                    </Box>
                </Paper>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                         <Paper sx={{ p: 3, height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 2 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>Distribuição de Vendas</Typography>
                            {salesSummary.total > 0 ? (
                                <Box sx={{ width: '100%', height: 250 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                                                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                                            </Pie>
                                            <RechartsTooltip formatter={(value) => formatMoney(value)} />
                                            <Legend verticalAlign="bottom" height={36}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            ) : (<Box sx={{ flexGrow:1, display:'flex', alignItems:'center', color:'text.secondary' }}>Sem dados.</Box>)}
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column', boxShadow: 2 }}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>Observações e Fechamento</Typography>
                            <TextField fullWidth multiline rows={4} placeholder="Observações..." variant="outlined" value={observations} onChange={e => setObservations(e.target.value)} sx={{ bgcolor: '#fafafa', mb: 3, flexGrow: 1 }} />
                            <Button variant="contained" color="error" size="large" startIcon={<ExitToAppIcon />} onClick={handleCloseCashier} sx={{ py: 2, fontWeight: 'bold' }}>ENCERRAR CAIXA</Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        )}

        {/* ABA 1: ENTRADAS */}
        {activeTab === 1 && cashierData && (
            <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer><Table><TableHead sx={{ bgcolor: '#f8f9fa' }}><TableRow><TableCell>ID</TableCell><TableCell>Hora</TableCell><TableCell>Valor</TableCell><TableCell>Pagamento</TableCell><TableCell>Garçom</TableCell></TableRow></TableHead><TableBody>{todaysOrders.map((order) => (<TableRow key={order._id} hover><TableCell>#{order._id.slice(-4)}</TableCell><TableCell>{new Date(order.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</TableCell><TableCell fontWeight="bold">{formatMoney(order.totalPrice)}</TableCell><TableCell><Chip label={order.paymentMethod} size="small" /></TableCell><TableCell>{order.waiterId?.name || '-'}</TableCell></TableRow>))}</TableBody></Table></TableContainer>
            </Paper>
        )}

        {/* === ABA 2: HISTÓRICO COMPLETO === */}
        {activeTab === 2 && (
             <Box>
                <Paper sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField label="Início" type="date" size="small" InputLabelProps={{ shrink: true }} value={dateStart} onChange={e => setDateStart(e.target.value)} />
                        <TextField label="Fim" type="date" size="small" InputLabelProps={{ shrink: true }} value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
                        <Button variant="contained" startIcon={<SearchIcon/>} onClick={fetchHistory}>Buscar</Button>
                    </Box>
                    {historyData.length > 0 && (
                        <Button variant="contained" color="secondary" startIcon={<PrintIcon/>} onClick={() => handlePrintHistory()}>
                            Imprimir Relatório
                        </Button>
                    )}
                </Paper>

                {loadingHistory ? <CircularProgress /> : (
                    <Box>
                        {historyData.length > 0 ? (
                            <>
                                <Paper elevation={0} sx={{ p: 2, mb: 4, bgcolor: '#f8f9fa', border: '1px solid #ccc' }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <DateRangeIcon /> Resumo Consolidado do Período
                                    </Typography>
                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        <Grid item xs={6} md={3}><Typography variant="caption" color="text.secondary">TOTAL DINHEIRO</Typography><Typography variant="h6" fontWeight="bold">{formatMoney(historyTotals.cash)}</Typography></Grid>
                                        <Grid item xs={6} md={3}><Typography variant="caption" color="text.secondary">TOTAL CARTÕES</Typography><Typography variant="h6" fontWeight="bold">{formatMoney(historyTotals.card)}</Typography></Grid>
                                        <Grid item xs={6} md={3}><Typography variant="caption" color="text.secondary">TOTAL PIX</Typography><Typography variant="h6" fontWeight="bold">{formatMoney(historyTotals.pix)}</Typography></Grid>
                                        <Grid item xs={6} md={3}><Typography variant="caption" color="text.secondary">FATURAMENTO TOTAL</Typography><Typography variant="h5" fontWeight="bold" color="primary.main">{formatMoney(historyTotals.total)}</Typography></Grid>
                                    </Grid>
                                </Paper>

                                {historyData.map((cashier) => (
                                    <Accordion key={cashier._id} sx={{ mb: 1, boxShadow: 1 }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Grid container alignItems="center">
                                                <Grid item xs={3}><Typography fontWeight="bold">{new Date(cashier.openedAt).toLocaleDateString()}</Typography></Grid>
                                                <Grid item xs={3}><Typography variant="body2">Op: {cashier.operator?.name || 'Admin'}</Typography></Grid>
                                                <Grid item xs={3}><Typography variant="body2">Vendas: <strong>{formatMoney((cashier.summary?.systemBalance || 0) - (cashier.initialBalance || 0))}</strong></Typography></Grid>
                                                <Grid item xs={3} textAlign="right">
                                                    <Chip label={cashier.summary?.difference === 0 ? "OK" : formatMoney(cashier.summary?.difference)} color={cashier.summary?.difference < 0 ? "error" : "success"} size="small" />
                                                </Grid>
                                            </Grid>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ bgcolor: '#fafafa' }}>
                                            <Table size="small">
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell>Dinheiro: {formatMoney(cashier.summary?.totalSalesCash)}</TableCell>
                                                        <TableCell>Cartão: {formatMoney(cashier.summary?.totalSalesCard)}</TableCell>
                                                        <TableCell>Pix: {formatMoney(cashier.summary?.totalSalesPix)}</TableCell>
                                                        <TableCell><strong>Total: {formatMoney(cashier.summary?.systemBalance - cashier.initialBalance)}</strong></TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </>
                        ) : (
                            <Typography align="center" sx={{ mt: 4 }}>Nenhum registro encontrado.</Typography>
                        )}
                    </Box>
                )}
             </Box>
        )}

        {/* --- ÁREAS DE IMPRESSÃO (Técnica: Fixado Fora da Tela) --- */}
        {/* IMPORTANTE: Não use display: none aqui! Use a técnica do fixed negativo */}
        <div style={{ position: 'fixed', top: 0, left: '-10000px', width: '210mm', zIndex: -1 }}>
            
            {/* 1. IMPRESSÃO DIA ATUAL */}
            <div ref={printCurrentRef} style={{ padding: '20px', backgroundColor: 'white', color: '#000' }}>
                <Typography variant="h5" align="center" fontWeight="bold">RELATÓRIO DE FECHAMENTO</Typography>
                <Typography align="center">{new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}</Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}><Typography><strong>Abertura:</strong> {formatMoney(safeInitialBalance)}</Typography></Grid>
                    <Grid item xs={6}><Typography><strong>Faturamento:</strong> {formatMoney(salesSummary.total)}</Typography></Grid>
                </Grid>
                <Table size="small" sx={{ mb: 2 }}>
                    <TableHead><TableRow><TableCell>Forma</TableCell><TableCell align="right">Valor</TableCell></TableRow></TableHead>
                    <TableBody>
                        <TableRow><TableCell>Crédito</TableCell><TableCell align="right">{formatMoney(salesSummary.credit)}</TableCell></TableRow>
                        <TableRow><TableCell>Débito</TableCell><TableCell align="right">{formatMoney(salesSummary.debit)}</TableCell></TableRow>
                        <TableRow><TableCell>Pix</TableCell><TableCell align="right">{formatMoney(salesSummary.pix)}</TableCell></TableRow>
                        <TableRow><TableCell>Dinheiro (Vendas)</TableCell><TableCell align="right">{formatMoney(salesSummary.cash)}</TableCell></TableRow>
                        <TableRow><TableCell><strong>(-) Retiradas</strong></TableCell><TableCell align="right">- {formatMoney(cashRetirada || 0)}</TableCell></TableRow>
                        <TableRow><TableCell><strong>(=) SALDO GAVETA</strong></TableCell><TableCell align="right"><strong>{formatMoney(totalNaGaveta)}</strong></TableCell></TableRow>
                    </TableBody>
                </Table>
                {observations && <Typography sx={{mt:2}}>Obs: {observations}</Typography>}
            </div>

            {/* 2. IMPRESSÃO HISTÓRICO */}
            <div ref={printHistoryRef} style={{ padding: '20px', backgroundColor: 'white', color: '#000' }}>
                <Typography variant="h4" align="center" fontWeight="bold">RELATÓRIO DE PERÍODO</Typography>
                <Typography align="center" variant="subtitle1">{dateStart} até {dateEnd}</Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ border: '1px solid #000', p: 2, mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">RESUMO GERAL</Typography>
                    <Grid container>
                        <Grid item xs={6}><Typography>Dinheiro: {formatMoney(historyTotals.cash)}</Typography></Grid>
                        <Grid item xs={6}><Typography>Cartões: {formatMoney(historyTotals.card)}</Typography></Grid>
                        <Grid item xs={6}><Typography>Pix: {formatMoney(historyTotals.pix)}</Typography></Grid>
                        <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                        <Grid item xs={6}><Typography fontWeight="bold">TOTAL: {formatMoney(historyTotals.total)}</Typography></Grid>
                    </Grid>
                </Box>
                <Typography variant="h6">Detalhamento</Typography>
                <Table size="small">
                    <TableHead><TableRow><TableCell>Data</TableCell><TableCell align="right">Venda Total</TableCell></TableRow></TableHead>
                    <TableBody>
                        {historyData.map((c) => (
                            <TableRow key={c._id}>
                                <TableCell>{new Date(c.openedAt).toLocaleDateString()}</TableCell>
                                <TableCell align="right">{formatMoney((c.summary?.systemBalance || 0) - (c.initialBalance || 0))}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>

      </Box>
    </AppSidebar>
  );
};

export default Cashier;