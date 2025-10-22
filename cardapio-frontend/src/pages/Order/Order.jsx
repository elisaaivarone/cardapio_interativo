import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getItems, createOrder, getOrders, updateOrderStatus } from '../../services/api';
import ProductModal from '../../components/ProductModal/ProductModal.jsx';


import styles from './Order.module.css';

function Order() {
  const navigate = useNavigate();
  const [menuType, setMenuType] = useState('allDay');
  const [currentOrder, setCurrentOrder] = useState([]);
  const [customerName, setCustomerName] = useState('');
  
  //Estados para os produtos carregados da api
  const [breakfastItems, setBreakfastItems] = useState([]);
  const [allDayItems, setAllDayItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
 
  //Estado para o modal de customização
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  //Estado para envio do pedido
  const [sendingOrder, setSendingOrder] = useState(false);

  //Estados para pedidos prontos
  const [activeTab, setActiveTab] = useState('current'); // 'current' ou 'ready'
  const [readyOrders, setReadyOrders] = useState([]);
  const [loadingReadyOrders, setLoadingReadyOrders] = useState(false);
  const [errorReadyOrders, setErrorReadyOrders] = useState('');
  
  //Para buscar os menus
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoadingMenu(true);
        const [breakfastData, allDayData] = await Promise.all([
          getItems({ menu: 'breakfast' }),
          getItems({ menu: 'allDay' })
        ]);
        
        setBreakfastItems(breakfastData);
        setAllDayItems(allDayData);
      } catch (error) {
        console.error("Erro ao buscar menus:", error);
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchMenus();
  }, []);

  //Pegar pedidos prontos ao mudar para a aba "Prontos"
  useEffect(() => {
    const fetchReadyOrders = async () => {
      try {
        setLoadingReadyOrders(true);
        setErrorReadyOrders('');
        const orders = await getOrders('ready'); // Busca pedidos com status 'ready'
        setReadyOrders(orders);
      } catch (error) {
        console.error("Erro ao buscar pedidos prontos:", error);
        setErrorReadyOrders('Não foi possível carregar os pedidos prontos.');
      } finally {
        setLoadingReadyOrders(false);
      }
    };

    // Só busca se a aba "Prontos" estiver ativa
    if (activeTab === 'ready') {
      fetchReadyOrders();

      // Atualizar a cada X segundos enquanto a aba estiver ativa
      const intervalId = setInterval(fetchReadyOrders, 30000); 
      return () => clearInterval(intervalId); // Limpa o intervalo ao trocar de aba ou desmontar
    }
  }, [activeTab]); // Dependência: Roda sempre que activeTab mudar

  const menuToDisplay = menuType === 'breakfast' ? breakfastItems : allDayItems;
 
  // FUNÇÃO PARA FAZER LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  // FUNÇÃO PARA ADICIONAR ITENS AO PEDIDO
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

  // FUNÇÃO PARA ADICIONAR ITENS DO MODAL AO CARRINHO
  const handleAddToCart = (item) => {
    setCurrentOrder(prevOrder => [...prevOrder, item]);
  };

  // FUNÇÃO PARA REMOVER ITENS DO PEDIDO
  const handleRemoveItem = (indexToRemove) => {
    const newOrder = currentOrder.filter((_, index) => index !== indexToRemove);
    setCurrentOrder(newOrder);
  };
  
  // FUNÇÃO PARA ENVIAR O PEDIDO PARA A COZINHA
  const handleSendOrder = async () => {
    if (currentOrder.length === 0) {
      toast.warn('O pedido está vazio. Adicione itens antes de enviar.');
      return;
    }
    if (!customerName.trim()) {
      toast.warn('Por favor, insira o nome do cliente.');
      return;
    }
    setSendingOrder(true);

    const orderData = {
      clientName: customerName.trim(),
      items: currentOrder.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
      })),
      totalPrice: total
    };
    try {
      const createdOrder =  await createOrder(orderData);
      console.log('Pedido criado com sucesso:', createdOrder);
      toast.success(`Pedido para ${customerName} foi enviado para a cozinha!`);
      setCurrentOrder([]);
      setCustomerName('');
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      toast.error('Erro ao enviar o pedido. Tente novamente.');
    } finally {
      setSendingOrder(false);
    } 
  };
 
  // FUNÇÃO PARA MARCAR PEDIDO COMO ENTREGUE
  const handleMarkAsDelivered = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'delivered');
      setReadyOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      toast.info(`Pedido #${orderId.slice(-4)} marcado como entregue!`);
    } catch (error) {
      console.error("Erro ao marcar pedido como entregue:", error);
      toast.error('Erro ao atualizar status do pedido. Tente novamente.');
    }
  };

  // CÁLCULO DO TOTAL DO PEDIDO
  const total = currentOrder.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className={styles.orderPage}>
      {/* SEÇÃO DO MENU (LADO ESQUERDO) */}
      <div className={styles.menuSection}>
        <div className={styles.menuToggle}>
          
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
          {loadingMenu ? (
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
          <h2>{activeTab === 'current' ? 'Resumo do Pedido' : 'Pedidos Prontos'}</h2>

          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>

        </div> 

        {/*Abas de navegação*/} 
        <div className={styles.tabNav}>
          <button
            className={activeTab === 'current' ? styles.active : ''}
            onClick={() => setActiveTab('current')}
            >
            Pedido Atual
          </button>
          <button
            className={activeTab === 'ready' ? styles.active : ''}
            onClick={() => setActiveTab('ready')}
            >
            Pedidos Prontos ({readyOrders.length}) {/* Mostra a contagem de pedidos prontos */}
          </button>
        </div>

        {/* Conteúdo da Aba: Pedido Atual */}
        {activeTab === 'current' && (
          <div className={styles.tabContent}>
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
                  <li key={item.orderItemId || index}>
                    <div>
                      <strong>{item.name}</strong>
                      <p>R$ {item.price.toFixed(2)}</p>
                    </div>

                    <button onClick={() => handleRemoveItem(index)} className={styles.removeButton}>
                      X
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className={styles.total}>
              <strong>Total: R$ {total.toFixed(2)}</strong>
            </div>

            <button 
              className={styles.sendButton}
              onClick={handleSendOrder}
              disabled={sendingOrder}
            >
            {sendingOrder ? 'Enviando...' : 'Enviar Para Cozinha' }
            </button>
          </div>
        )}

        {/* Conteúdo da Aba: Pedidos Prontos */}
        {activeTab === 'ready' && (
          <div className={styles.tabContent}>
            {loadingReadyOrders && <p>Carregando...</p>}
            {errorReadyOrders && <p className={styles.error}>{errorReadyOrders}</p>}

            {!loadingReadyOrders && readyOrders.length === 0 && !errorReadyOrders ? (
              <p>Nenhum pedido pronto no momento.</p>
        ) : ( 
          <ul className={styles.readyOrdersList}>
            {readyOrders.map(order => (
              <li key={order._id} className={styles.readyOrderCard}>
                <div>
                  <strong>Cliente: {order.clientName}</strong> (ID: #{order._id.slice(-4)})
                  <ul>
                    {order.items.map((item, idx) => <li key={idx}>- {item.name}</li>)}
                  </ul>
                </div>
                <button 
                  className={styles.deliverButton}
                  onClick={() => handleMarkAsDelivered(order._id)}
                >
                Marcar como Entregue
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      )}
    </div>

      {/* Modal de Customização de Produto */}
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