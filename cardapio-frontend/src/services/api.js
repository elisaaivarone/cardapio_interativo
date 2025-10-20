import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Cria uma instância do Axios com a URL base da API
const api = axios.create({
  baseURL: 'http://localhost:3001/api', 
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

