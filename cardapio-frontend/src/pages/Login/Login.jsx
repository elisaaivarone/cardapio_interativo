import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { loginUser } from '../../services/api';

function Login() {
  // Criando "estados" para guardar o email e a senha
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const Navigate = useNavigate();

  // Função que faz o envio do formulário
  const handleSubmit = async (event) => {
    event.preventDefault(); // Previne que a página recarregue ao enviar
    setError(''); // Limpa mensagens de erro anteriores
    setLoading(true);

     try {
      const data = await loginUser(email, password);
      console.log('Login bem-sucedido! Token:', data.token);
      // TODO: Salvar o token e redirecionar o usuário para o Dashboard
      localStorage.setItem('token', data.token);

      Navigate('/dashboard');

    } catch (err) {
      // Se o login falhar, a API retorna um erro que capturamos aqui
      setError('Email ou senha inválidos. Tente novamente.');
      console.error('Erro no login:', err);
    } finally {
      setLoading(false); // Finaliza o carregamento, independente do resultado
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