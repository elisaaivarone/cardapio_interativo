import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // Verifica se o token existe no localStorage
  const token = localStorage.getItem('token');

  // Se não houver token, redireciona para a página de login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Se houver token, renderiza o componente filho (a página que queremos proteger)
  return children;
}

export default ProtectedRoute;