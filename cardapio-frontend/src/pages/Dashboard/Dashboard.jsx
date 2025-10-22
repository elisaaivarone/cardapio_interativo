import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmToast from "../../components/ConfirmToast/ConfirmToast.jsx";
import { getItems, createItem, deleteItem, updateItem } from "../../services/api.js";
import ItemModal from "../../components/ItemModal/ItemModal";

import styles from "./Dashboard.module.css";

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
      toast.error('Não foi possível salvar o item.');
    }
  };

  const executeDelete = async (id) => {
    try {
      await deleteItem(id);   
      setItems(items.filter(item => item._id !== id)); // Remove o item da lista
      toast.success('Item deletado com sucesso!');
    } catch (err) {
      console.error("Falha ao deletar item:", err);
      toast.error('Não foi possível deletar o item.');
    }
  };

  const handleDeleteConfirmation = (id) => {
    toast(
      // Passamos a função closeToast (que o react-toastify nos dá) e a função executeDelete
      ({ closeToast }) => (
        <ConfirmToast
          closeToast={closeToast}
          onConfirm={() => executeDelete(id)} 
          message="Tem certeza que deseja deletar este item?"
        />
      ), 
      {
        position: "top-center", 
        autoClose: false,      
        closeOnClick: false,  
        draggable: false,    
        closeButton: true,     
        pauseOnHover: true,
      }
    );
  };

if (loading) {
  return <div>Carregando cardápio...</div>;
}
  
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1>Dashboard</h1>
          <p>Bem-vindo ao painel de administração!</p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={handleLogout} className={`${styles.button} ${styles.buttonSecondary}`}>Logout</button>
          <button onClick={handleAddNew} className={`${styles.button} ${styles.buttonPrimary}`}>Adicionar Item</button>
        </div>
      </header>

      <h2>Itens do Cardápio</h2>
        {error && <p className={styles.error}>{error}</p>}

        {items.length === 0 && !error ? (
            <p>Nenhum item encontrado.</p>
        ) : (
            <ul className={styles.itemList}>
          {items.map(item => (
            <li key={item._id} className={styles.itemCard}>
              <img 
                src={item.imageUrl || 'https://via.placeholder.com/300x200?text=Sem+Imagem'} // Imagem placeholder
                alt={item.name} 
                className={styles.itemImage} 
              />
              <div className={styles.itemContent}>
                <div className={styles.itemHeader}>
                  <h3>{item.name}</h3>
                  <span className={styles.itemPrice}>R$ {item.price.toFixed(2)}</span>
                </div>
                <p className={styles.itemDescription}>{item.description}</p>
                <span className={styles.itemCategory}>{item.category}</span>
                
                <div className={styles.itemActions}>
                  <button onClick={() => handleEdit(item)} className={`${styles.button} ${styles.buttonSmall}`}>
                    Editar
                  </button>
                  <button onClick={() => handleDeleteConfirmation(item._id)} className={`${styles.button} ${styles.buttonSmall} ${styles.buttonSecondary}`}>
                    Deletar
                  </button>
                </div>
              </div>
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