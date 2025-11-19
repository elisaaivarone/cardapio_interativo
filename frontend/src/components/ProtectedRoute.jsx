// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

// Função auxiliar para ler o localStorage de forma segura
const getSafeUser = () => {
  try {
    const userString = localStorage.getItem('user');
    if (!userString) {
      return null;
    }
    return JSON.parse(userString);
  } catch (error) {
    console.error("Falha ao analisar o 'user' do localStorage:", error);
    return null;
  }
};

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const user = getSafeUser(); 

  if (!token || !user) {
    return <Navigate to="/login" />;
  }
  
  // Se o usuário não tiver a função correta...
  if (user.role !== role) {
    
    if (user.role === 'admin') return <Navigate to="/dashboard" />;
    if (user.role === 'hall') return <Navigate to="/order" />;
    if (user.role === 'kitchen') return <Navigate to="/kitchen" />;
    
 
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;