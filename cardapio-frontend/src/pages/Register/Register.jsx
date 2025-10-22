import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { toast } from 'react-toastify';
import { registerUser } from '../../services/api';

import styles from './Register.module.css'; 

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('hall'); 
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const userData = { name, email, password, role };

    try {
      const result = await registerUser(userData);
      toast.success(result.message || 'Usuário registrado com sucesso!');
      navigate('/login'); 
    } catch (error) {
      console.error('Erro no registro:', error);
      toast.error(error.message || 'Erro ao registrar. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerForm}>
        <h2>Registrar Novo Funcionário</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Nome</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="role">Função</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="hall">Salão</option>
              <option value="kitchen">Cozinha</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>
        <p className={styles.loginLink}>
          Já tem uma conta? <Link to="/login">Faça login aqui</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;