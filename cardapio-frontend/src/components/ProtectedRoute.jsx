import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, role }) {
  // Verifica se o token existe no localStorage
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // Se não houver token, redireciona para a página de login
  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  // Se uma role específica for exigida, verifica se o usuário tem essa role
  if (user.role !== role) {
    if (user.role === 'admin') {
      return <Navigate to="/dashboard" />;
    }
    if (user.role === 'hall') {
      return <Navigate to="/order" />;
    }
    if (user.role === 'kitchen') {
      return <Navigate to="/kitchen" />;
    }
    
  }
  
  // Se houver token, renderiza o componente filho (a página que queremos proteger)
  return children;
}

export default ProtectedRoute;