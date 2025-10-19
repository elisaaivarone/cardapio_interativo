import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/api';
import { jwtDecode } from 'jwt-decode'; 

import styles from './Login.module.css';

function Login() {
  // Criando "estados" para guardar o email e a senha
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  
  // Função que faz o envio do formulário
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. CHAME A API E PEGUE OS DADOS 
      const data = await loginUser(email, password);
      
      // 2. SALVE O TOKEN NO LOCALSTORAGE
      localStorage.setItem('token', data.token);

      // 3. DECODIFIQUE O TOKEN PARA PEGAR O USUÁRIO (incluindo o role)
      const user = jwtDecode(data.token).user; 
      
      localStorage.setItem('user', JSON.stringify(user));

      // 4. DECIDA PARA ONDE IR usando 'navigate
      if (user.role === 'admin') {
        navigate('/dashboard');
      } else if (user.role === 'hall') {
        navigate('/order');
      } else if (user.role === 'kitchen') {
        navigate('/kitchen');
      }

    } catch (err) {
      setError('Email ou senha inválidos. Tente novamente.');
      console.error('Erro no login:', err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.loginPage}>
      <div className={styles.loginForm}>
        <h2>Acessar Painel</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="seuemail@exemplo.com" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <input 
              type="password" 
              id="password" 
              placeholder="********"
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {/* Exibe a mensagem de erro, se houver */}
          {error && <p className={styles.error}>{error}</p>}

          {/* Desabilita o botão e muda o texto durante o carregamento */}
          <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;