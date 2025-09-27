import axios from 'axios';

// Cria uma instância do Axios com a URL base da API
const api = axios.create({
  baseURL: 'http://localhost:3001/api', 
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