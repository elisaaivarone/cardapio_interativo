import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  // 1. Tenta pegar o user e o token (verificando os dois lugares possíveis)
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token'); 

  // 2. Se não tiver usuário OU não tiver token, manda pro Login
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // 3. Verificação de Permissão (Lista ou Texto Único)
  if (role) {
    // Normaliza o cargo do usuário para minúsculo para evitar erro de Admin vs admin
    const userRole = user.role ? user.role.toLowerCase() : '';

    if (Array.isArray(role)) {
      // Se 'role' for Lista (Ex: ['admin', 'hall'])
      // Verifica se ALGUM dos cargos da lista bate com o do usuário
      const hasPermission = role.some(r => r.toLowerCase() === userRole);
      if (!hasPermission) {
        return <Navigate to="/login" replace />; 
      }
    } 
    else {
      // Se 'role' for Texto (Ex: 'admin')
      if (userRole !== role.toLowerCase()) {
        return <Navigate to="/login" replace />;
      }
    }
  }

  // 4. Se passou, mostra a página
  return children;
};

export default ProtectedRoute;