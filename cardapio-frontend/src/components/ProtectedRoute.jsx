// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

// Função auxiliar para ler o localStorage de forma segura
const getSafeUser = () => {
  try {
    const userString = localStorage.getItem('user');
    // Se não houver usuário, retorne null
    if (!userString) {
      return null;
    }
    // Se houver, tente converter
    return JSON.parse(userString);
  } catch (error) {
    // Se o JSON estiver corrompido, logue o erro e retorne null
    console.error("Falha ao analisar o 'user' do localStorage:", error);
    return null;
  }
};

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const user = getSafeUser(); // Usamos nossa função segura

  // Se não houver token ou usuário, expulsa para o login
  if (!token || !user) {
    return <Navigate to="/login" />;
  }
  
  // Se o usuário não tiver a função correta...
  if (user.role !== role) {
    // ...manda ele de volta para a página inicial da SUA função.
    if (user.role === 'admin') return <Navigate to="/dashboard" />;
    if (user.role === 'hall') return <Navigate to="/order" />;
    if (user.role === 'kitchen') return <Navigate to="/kitchen" />;
    
    // Se o role for desconhecido, apenas manda para o login
    return <Navigate to="/login" />;
  }

  // Se tiver token E a função correta, libera o acesso
  return children;
}

export default ProtectedRoute;