import { useNavigate } from "react-router-dom";

function Dashboard() {
  
const navigate = useNavigate();

const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
};

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bem-vindo ao painel de administração!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;