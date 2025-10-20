import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItems } from '../../services/api';
import ProductModal from '../../components/ProductModal/ProductModal.jsx';

import styles from './Order.module.css';

function Order() {
  const navigate = useNavigate();
  const [menuType, setMenuType] = useState('allDay');
  const [currentOrder, setCurrentOrder] = useState([]);
  const [customerName, setCustomerName] = useState('');
  
  const [breakfastItems, setBreakfastItems] = useState([]);
  const [allDayItems, setAllDayItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const breakfastData = await getItems({ menu: 'breakfast' });
        const allDayData = await getItems({ menu: 'allDay' });
        
        setBreakfastItems(breakfastData);
        setAllDayItems(allDayData);
      } catch (error) {
        console.error("Erro ao buscar menus:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  const menuToDisplay = menuType === 'breakfast' ? breakfastItems : allDayItems;

  const handleAddItem = (item) => {
  // Define se o item PRECISA de customização no modal
   const needsCustomization = 
      (item.category === 'Lanches' && item.menu === 'allDay') || 
      item.category === 'Acompanhamentos';                     

    if (needsCustomization) {
    // Se precisa, ABRE O MODAL
      setSelectedItem(item);
      setIsModalOpen(true);
    } else {
      handleAddToCart({ ...item, orderItemId: Date.now() });
    }
  };

  const handleAddToCart = (item) => {
    setCurrentOrder(prevOrder => [...prevOrder, item]);
  };

  // FUNÇÃO PARA REMOVER ITENS DO PEDIDO
  const handleRemoveItem = (indexToRemove) => {
    const newOrder = currentOrder.filter((_, index) => index !== indexToRemove);
    setCurrentOrder(newOrder);
  };
  
  // CÁLCULO DO TOTAL DO PEDIDO
  const total = currentOrder.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className={styles.orderPage}>
      {/* SEÇÃO DO MENU (LADO ESQUERDO) */}
      <div className={styles.menuSection}>
        <div className={styles.menuToggle}>
          {/* A FUNÇÃO setMenuType É USADA AQUI */}
          <button 
            className={menuType === 'breakfast' ? styles.active : ''} 
            onClick={() => setMenuType('breakfast')}
          >
            Café da Manhã
          </button>
          <button 
            className={menuType === 'allDay' ? styles.active : ''} 
            onClick={() => setMenuType('allDay')}
          >
            Almoço / Jantar
          </button>
        </div>
        <div className={styles.productList}>
          {loading ? (
            <p>Carregando produtos...</p>
          ) : (
            menuToDisplay.map(item => (
              <div key={item._id} className={styles.productCard} onClick={() => handleAddItem(item)}>
                <h3>{item.name}</h3>
                <p>R$ {item.price.toFixed(2)}</p>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* SEÇÃO DO RESUMO (LADO DIREITO) */}
      <div className={styles.summarySection}>
        <div className={styles.summaryHeader}> 
          <h2>Resumo do Pedido</h2>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>  
        {/* AS VARIÁVEIS customerName E setCustomerName SÃO USADAS AQUI */}
        <div className={styles.inputGroup}>
          <label htmlFor="customerName">Nome do Cliente:</label>
          <input 
            type="text" 
            id="customerName" 
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <ul className={styles.orderList}>
          {currentOrder.length === 0 ? (
            <p>Seu pedido está vazio.</p>
          ) : (
            currentOrder.map((item, index) => (
              <li key={index}>
                <div>
                  <strong>{item.name}</strong>
                  <p>R$ {item.price.toFixed(2)}</p>
                </div>
                {/* A FUNÇÃO handleRemoveItem É USADA AQUI */}
                <button onClick={() => handleRemoveItem(index)} className={styles.removeButton}>
                  X
                </button>
              </li>
            ))
          )}
        </ul>

        <div className={styles.total}>
          {/* A VARIÁVEL total É USADA AQUI */}
          <strong>Total: R$ {total.toFixed(2)}</strong>
        </div>
        <button className={styles.sendButton}>Enviar para Cozinha</button>
      </div>
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedItem}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

export default Order;