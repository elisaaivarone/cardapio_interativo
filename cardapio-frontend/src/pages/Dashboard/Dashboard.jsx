import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getItems, createItem, deleteItem, updateItem } from "../../services/api.js";
import ItemModal from "../../components/ItemModal/ItemModal";

function Dashboard() {
  
const navigate = useNavigate();
const [items, setItems] = useState([]); //Guarda a lista de itens
const [loading, setLoading] = useState(true); // Indica se está carregando
const [error, setError] = useState(null); // Guarda as mensagens de erro
const [isModalOpen, setIsModalOpen] = useState(false); // Controla a exibição do modal
const [editingItem, setEditingItem] = useState(null); // Guarda o item que está sendo editado


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

// Função para abrir o modal de edição
const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

// Função para abrir o modal de criação
const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

const handleSave = async (itemData) => {
    try {
      if (editingItem) {
        const updatedItem = await updateItem(editingItem._id, itemData);
        setItems(items.map(item => item._id === updatedItem._id ? updatedItem : item));
      } else {
        const newItem = await createItem(itemData);
        setItems([...items, newItem]);
      }
      handleCloseModal();
    } catch (err) {
      console.error("Falha ao salvar item:", err);
      setError('Não foi possível salvar o item.');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este item?')) {
      return;
    }
    try {
      await deleteItem(id);   
      setItems(items.filter(item => item._id !== id)); // Remove o item da lista
    } catch (err) {
      console.error("Falha ao deletar item:", err);
      setError('Não foi possível deletar o item.');
    }
  };

if (loading) {
  return <div>Carregando cardápio...</div>;
}
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bem-vindo ao painel de administração!</p>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={handleAddNew}>Adicionar Item</button>

      <h2>Itens do Cardápio</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {items.length === 0 && !error ? (
            <p>Nenhum item encontrado.</p>
        ) : (
            <ul>
                {items.map((item) => (
                    <li key={item._id} style={{ display: "flex"}}>
                      <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          width="100"
                          style={{ width: '100px', height: '100px', objectFit: 'cover', marginRight: '1rem' }} />
                      <h3><strong>{item.name}</strong></h3>
                      <p>{item.description}</p>
                      <p>R$ {item.price.toFixed(2)}</p>
                      <p>Categoria: {item.category}</p>
                      
                      <button onClick={() => handleEdit(item)}>Editar</button>
                      <button onClick={() => handleDeleteItem(item._id)}>Deletar</button>
                    </li>
                ))}
            </ul>
        )}

      <ItemModal 
      isOpen={isModalOpen} 
      onClose={handleCloseModal} 
      onSave={handleSave}
      currentItem={editingItem}
    />
    </div>
  );
}

export default Dashboard;