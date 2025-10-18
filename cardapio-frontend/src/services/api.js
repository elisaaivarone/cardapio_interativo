import axios from 'axios';

// Cria uma instância do Axios com a URL base da API
const api = axios.create({
  baseURL: 'http://localhost:3001/api', 
});

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
    // Se a API retornar um erro (ex: 400), o Axios o captura aqui.
    // "relançamos" o erro para que o componente que chamou esta função possa tratá-lo.
    throw error.response.data;
  }
};

//Função para buscar os itens do cardápio
export const getItems = async () => {
  try {
    const response = await api.get('/itens');
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

