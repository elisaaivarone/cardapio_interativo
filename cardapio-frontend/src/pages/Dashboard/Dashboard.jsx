import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getItems } from "../../services/api";

function Dashboard() {
  
const navigate = useNavigate();
const [items, setItems] = useState([]); //Guarda a lista de itens
const [loading, setLoading] = useState(true); // Indica se está carregando
const [error, setError] = useState(null); // Guarda as mensagens de erro

useEffect(() => {
    //Função para buscar os dados
  const fetchItems = async () => {
    try {
      const data = await getItems();
      setItems(data);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      setError('Erro ao buscar itens. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  fetchItems();
}, []);

const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
};

if (loading) {
  return <div>Carregando cardápio...</div>;
}
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bem-vindo ao painel de administração!</p>
      <button onClick={handleLogout}>Lo</button>

      <h2>Itens do Cardápio</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {items.length === 0 && !error ? (
            <p>Nenhum item encontrado.</p>
        ) : (
            <ul>
                {items.map((item) => (
                    <li key={item._id}>
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <p>R$ {item.price.toFixed(2)}</p>
                        </li>
                ))}
            </ul>
        )}
    </div>
  );
}

export default Dashboard;