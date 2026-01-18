import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Cria uma instância do Axios com a URL base da API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

export const saveTokenAndGetUser = (token) => {
  localStorage.setItem('token', token);
  const userData = jwtDecode(token);
  // Salva o usuário inteiro (que agora tem id e role) no localStorage
  localStorage.setItem('user', JSON.stringify(userData.user));
  return userData.user;
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
// --- INTERCEPTOR ---
// Esta função será executada ANTES de cada requisição
api.interceptors.request.use(async (config) => {
  
  const token = localStorage.getItem('token');
  if (token) {
    // Se o token existir, adiciona ao cabeçalho de Autorização
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Função de login que o componente vai chamar
export const loginUser = async (email, password) => {
  try {
    // Faz a requisição POST para o endpoint /auth/login, enviando email e senha
    const response = await api.post('/auth/login', { email, password });

    // Retorna os dados da resposta (que deve conter o token)
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Função de registro que o componente vai chamar
export const registerUser = async (formData) => {
  try {
    const response = await api.post('/auth/register', formData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

//Função para buscar os itens do cardápio
export const getItems = async (params = {}) => {
  try {
    const response = await api.get('/itens', { params });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

//Função para criar um novo item 
export const createItem = async (itemData) => {
  try {
    const response = await api.post('/itens', itemData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  } 
};

//Função para deletar um item
export const deleteItem = async (id) => {
  try {
    const response = await api.delete(`/itens/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}

//Função para atualizar um item
export const updateItem = async (id, itemData) => {
  try {
    const response = await api.patch(`/itens/${id}`, itemData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

//Função para criar um novo pedido
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }   
};

//Função para buscar pedidos com filtro por status
export const getOrders = async (status) => {
  try {
    const response = await api.get('/orders', { params: { status } });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

//Função para atualizar o status de um pedido
export const updateOrderStatus = async (id, status) => {
  try {
    const response = await api.patch(`/orders/${id}`, { status });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

//Função para processar o pagamento de um pedido
export const processPayment = async (orderId, paymentData) => {
  try {
    const response = await api.patch(`/orders/${orderId}/pay`, paymentData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// --- ROTAS DO CAIXA (FINANCEIRO) ---

// Função para obter o status atual do caixa
export const getCashierStatus = async () => {
  const response = await api.get('/cashier/status');
  return response.data;
};

// Função para abrir o caixa
export const openCashier = async (initialBalance) => {
  const response = await api.post('/cashier/open', { initialBalance });
  return response.data;
};

// Função para fechar o caixa
export const closeCashier = async (finalBalanceDeclared) => {
  const response = await api.post('/cashier/close', { finalBalanceDeclared });
  return response.data;
};

// Função para adicionar uma transação (suprimento ou sangria)
export const addTransaction = async (type, description, value) => {
  // type: 'supply' (suprimento) ou 'bleed' (sangria)
  const response = await api.post('/cashier/transaction', { type, description, value });
  return response.data;
};

// Função para obter as transações do caixa atual
export const getTransactions = async () => {
  const response = await api.get('/cashier/transactions');
  return response.data;
};

// Função para obter o histórico do caixa em um intervalo de datas
export const getCashierHistory = async (startDate, endDate) => {
  const response = await api.get('/cashier/history', {
    params: { startDate, endDate }
  });
  return response.data;
};

// --- MÓDULO DE EQUIPE ---

// Listar todos os usuários
export const getTeam = async () => {
  const response = await api.get('/team');
  return response.data;
};

// Gerar convite
export const inviteMember = async (email, role) => {
  const response = await api.post('/team/invite', { email, role });
  return response.data; 
};

// Remover usuário
export const deleteMember = async (id) => {
  const response = await api.delete(`/team/${id}`);
  return response.data;
};

// --- MÓDULO DE USUÁRIO (PERFIL) ---

export const updateProfile = async (userId, data) => {
  const response = await api.put('/users/profile', { userId, ...data });
  return response.data;
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const response = await api.put('/users/password', { userId, currentPassword, newPassword });
  return response.data;
};

export const updateEmail = async (userId, newEmail) => {
  const response = await api.put('/users/email', { userId, newEmail });
  return response.data;
};

// Validar token ao abrir a página
export const validateInviteToken = async (token) => {
  const response = await api.get(`/auth/invite/${token}`);
  return response.data;
};

// Finalizar o cadastro
export const registerWithInvite = async (data) => {
  // data = { token, name, password }
  const response = await api.post('/auth/register-invite', data);
  return response.data;
};

// Atualizar imagem de perfil
export const updateProfileImage = async (userId, file) => {
  const formData = new FormData();
  formData.append('image', file); // 'image' é o nome do campo que o backend espera
  formData.append('userId', userId);

  // Faz a requisição PUT para atualizar a imagem do usuário
  const response = await api.put('/users/update-image', formData);
  return response.data;
};

export default api;