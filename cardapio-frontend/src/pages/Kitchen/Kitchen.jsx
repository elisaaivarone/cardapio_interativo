import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders, updateOrderStatus } from "../../services/api";
import styles from "./Kitchen.module.css";

function Kitchen() {
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const orders= await getOrders('pending');
      setPendingOrders(orders);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      setError('Erro ao buscar pedidos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    } 
  };  

  useEffect(() => {
    fetchPendingOrders();
    // Atualiza a lista de pedidos a cada 30 segundos
    const intervalId = setInterval(fetchPendingOrders, 30000);
    return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
  }, []);

  // Função para marcar um pedido como "ready"
  const handleMarkAsReady = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'ready');
      setPendingOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
    } catch (error) {
      console.error("Erro ao atualizar status do pedido:", error);
      alert('Erro ao atualizar status do pedido. Tente novamente.');
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Função para calcular o tempo decorrido desde a criação do pedido
  const calculateTimeElapsed = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created; // Diferença em milissegundos
    const diffMins = Math.floor(diffMs / 60000); // Converte para minutos
    return `${diffMins} minutos`; 
  };

  return (
    <div className={styles.kitchenPage}>
      <header className={styles.header}>
        <h1>Pedidos Pendentes (Cozinha)</h1>

        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
      </header>

      {loading && <p>Carregando pedidos...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.orderGrid}>
        {!loading && pendingOrders.length === 0 && !error ? (
          <p>Nenhum pedido pendente no momento.</p>
        ) : (
          pendingOrders.map(order => (
            <div key={order._id} className={styles.orderCard}>
              <h3>Pedido #{order._id.slice(-6)}</h3> {/* Mostra os últimos 6 dígitos do ID */}
              <p><strong>Cliente:</strong> {order.clientName}</p>
              <p><strong>Garçom:</strong> {order.waiterId?.name || 'N/A'}</p> {/* Usa o nome populado */}
              <p><strong>Tempo:</strong> {calculateTimeElapsed(order.createdAt)}</p>
              <ul className={styles.itemList}>
                {order.items.map((item, index) => (
                  <li key={index}>{item.name}</li>
                ))}
              </ul>

              <button 
                className={styles.readyButton} 
                onClick={() => handleMarkAsReady(order._id)}
              >
                Marcar como Pronto
              </button>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Kitchen;