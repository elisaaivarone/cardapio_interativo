const router = require('express').Router();
const Cashier = require('../models/Cashier');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/authMiddleware'); 

// 1. VERIFICAR STATUS (GET /api/cashier/status)
router.get('/status', authMiddleware, async (req, res) => {
  try {
    // Busca o último caixa aberto
    const activeCashier = await Cashier.findOne({ status: 'open' });
    
    if (!activeCashier) {
      return res.json({ isOpen: false, message: 'Caixa fechado.' });
    }

    res.json({ isOpen: true, cashier: activeCashier });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. ABRIR CAIXA (POST /api/cashier/open)
router.post('/open', authMiddleware, async (req, res) => {
  try {
    // Verifica se já tem um aberto
    const isOpen = await Cashier.findOne({ status: 'open' });
    if (isOpen) {
      return res.status(400).json({ message: 'Já existe um caixa aberto.' });
    }

    const { initialBalance } = req.body;

    const newCashier = new Cashier({
      operator: req.user.id, 
      initialBalance: Number(initialBalance),
      openedAt: new Date(),
      status: 'open'
    });

    await newCashier.save();
    res.status(201).json(newCashier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. FECHAR CAIXA (POST /api/cashier/close)
router.post('/close', authMiddleware, async (req, res) => {
  try {
    const activeCashier = await Cashier.findOne({ status: 'open' });
    if (!activeCashier) {
      return res.status(400).json({ message: 'Não há caixa aberto para fechar.' });
    }

    const { finalBalanceDeclared } = req.body; 

    // 1. Buscar todos os pedidos PAGOS feitos neste período
    const orders = await Order.find({
      status: 'paid', 
      updatedAt: { $gte: activeCashier.openedAt } 
    });

    // 2. Buscar Transações
    const transactions = await Transaction.find({
      cashierId: activeCashier._id
    });

    // 3. Calcular Totais
    let totalSalesCash = 0;
    let totalSalesCard = 0;
    let totalSalesPix = 0;

    orders.forEach(order => {
      if (order.paymentMethod === 'cash') totalSalesCash += (order.amountPaid - order.change); 
      if (order.paymentMethod === 'credit' || order.paymentMethod === 'debit') totalSalesCard += order.totalPrice;
      if (order.paymentMethod === 'pix') totalSalesPix += order.totalPrice;
    });

    // Calcular Suprimentos e Sangrias
    let totalSupply = 0; // Entradas extras
    let totalBleed = 0;  // Saídas (Sangrias)

    transactions.forEach(t => {
      if (t.type === 'supply') totalSupply += t.value;
      if (t.type === 'bleed') totalBleed += t.value;
    });

    // 4. Calcular Saldo do Sistema (Teórico)
    // Saldo Inicial + Vendas Dinheiro + Suprimentos - Sangrias
    const systemBalance = activeCashier.initialBalance + totalSalesCash + totalSupply - totalBleed;
    
    // Sobra ou Falta
    const difference = finalBalanceDeclared - systemBalance;

    // 5. Atualizar e Fechar
    activeCashier.status = 'closed';
    activeCashier.closedAt = new Date();
    activeCashier.finalBalanceDeclared = finalBalanceDeclared;
    
    // Preenchendo o seu objeto summary
    activeCashier.summary = {
      totalSalesCash,
      totalSalesCard,
      totalSalesPix,
      totalExpenses: totalBleed, // Usamos Expenses para Sangria
      systemBalance,
      finalBalanceDeclared,
      difference
    };

    await activeCashier.save();
    res.json(activeCashier);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. REGISTRAR TRANSAÇÃO (POST /api/cashier/transaction)
// Usado para Sangria (Retirada) ou Suprimento (Entrada)
router.post('/transaction', authMiddleware, async (req, res) => {
  try {
    // 1. Só pode movimentar se o caixa estiver aberto
    const activeCashier = await Cashier.findOne({ status: 'open' });
    if (!activeCashier) {
      return res.status(400).json({ message: 'Não há caixa aberto para realizar transações.' });
    }

    const { type, description, value } = req.body;

    // Validação básica
    if (!['supply', 'bleed'].includes(type)) {
      return res.status(400).json({ message: 'Tipo de transação inválido. Use "supply" ou "bleed".' });
    }
    if (!value || Number(value) <= 0) {
      return res.status(400).json({ message: 'O valor deve ser positivo.' });
    }

    // 2. Criar a transação
    const newTransaction = new Transaction({
      cashierId: activeCashier._id,
      user: req.user.id, 
      type,              
      description,     
      value: Number(value),
      date: new Date()
    });

    await newTransaction.save();

    // 3. Atualizar o resumo do caixa em tempo real
    // Salvar a transação. O cálculo final é feito no /close.
    
    res.status(201).json(newTransaction);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. LISTAR TRANSAÇÕES DO CAIXA ATUAL (GET /api/cashier/transactions)
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const activeCashier = await Cashier.findOne({ status: 'open' });
    if (!activeCashier) {
      return res.status(400).json({ message: 'Caixa fechado.' });
    }

    const transactions = await Transaction.find({ cashierId: activeCashier._id })
      .sort({ date: -1 }); 

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. HISTÓRICO DE FECHAMENTOS (GET /api/cashier/history)
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Filtro básico: Caixas fechados
    let filter = { status: 'closed' };

    // Se tiver datas, adiciona ao filtro
    if (startDate || endDate) {
      filter.openedAt = {};
      if (startDate) filter.openedAt.$gte = new Date(startDate);
      if (endDate) {
          // Ajuste para pegar até o final do dia
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filter.openedAt.$lte = end; 
      }
    }

    const history = await Cashier.find(filter)
      .populate('operator', 'name') 
      .sort({ openedAt: -1 }); 

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;