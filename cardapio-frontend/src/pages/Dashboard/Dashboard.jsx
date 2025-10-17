import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getItems, createItem } from "../../services/api.js";
import ItemModal from "../../components/ItemModal/ItemModal";

function Dashboard() {
  
const navigate = useNavigate();
const [items, setItems] = useState([]); //Guarda a lista de itens
const [loading, setLoading] = useState(true); // Indica se está carregando
const [error, setError] = useState(null); // Guarda as mensagens de erro
const [isModalOpen, setIsModalOpen] = useState(false); // Controla a exibição do modal

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

const handleSaveItem = async (itemData) => {
    try {
      const newItem = await createItem(itemData);
      setItems([...items, newItem]); // Adiciona o novo item à lista existente
      setIsModalOpen(false); // Fecha o modal
    } catch (err) {
      console.error("Falha ao criar item:", err);
      setError('Não foi possível salvar o novo item.');
    }
  };


if (loading) {
  return <div>Carregando cardápio...</div>;
}
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bem-vindo ao painel de administração!</p>
      <button onClick={handleLogout}>Lo</button>
      <button onClick={() => setIsModalOpen(true)}>Adicionar Item</button>

      <h2>Itens do Cardápio</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {items.length === 0 && !error ? (
            <p>Nenhum item encontrado.</p>
        ) : (
            <ul>
                {items.map((item) => (
                    <li key={item._id}>
                      <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          width="100"
                          style={{ width: '100px', height: '100px', objectFit: 'cover', marginRight: '1rem' }} />
                      <h3><strong>{item.name}</strong></h3>
                      <p>{item.description}</p>
                      <p>R$ {item.price.toFixed(2)}</p>
                    </li>
                ))}
            </ul>
        )}

      <ItemModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
      onSave={handleSaveItem}
    />
    </div>
  );
}

export default Dashboard;