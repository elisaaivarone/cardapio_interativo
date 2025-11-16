import { useState, useEffect } from 'react';
import styles from './ProductModal.module.css';

function ProductModal({ isOpen, onClose, product, onAddToCart }) {
  const [burgerType, setBurgerType] = useState('bovino');
  const [extras, setExtras] = useState({ queijo: false, ovo: false });

  // Reseta o estado quando o modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setBurgerType('bovino');
      setExtras({ queijo: false, ovo: false });
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  // Verifica se o item é um hambúrguer para mostrar as opções
  const isBurger = product.category === 'Lanches' && product.menu === 'allDay';

  const handleExtraChange = (extra) => {
    setExtras(prev => ({ ...prev, [extra]: !prev[extra] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let price = product.price;
    let name = product.name;
    let details = [];

    if (isBurger) {
      details.push(burgerType);
    }
    if (extras.queijo) {
      price += 1; 
      details.push('queijo');
    }
    if (extras.ovo) {
      price += 1; 
      details.push('ovo');
    }

    // Cria um nome final para o item no carrinho
    if (details.length > 0) {
      name = `${product.name} (${details.join(', ')})`;
    }

    // Cria o item final para o carrinho
    const cartItem = {
      ...product,
      name,
      price,
      orderItemId: Date.now() 
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{product.name}</h2>
        <p>R$ {product.price.toFixed(2)} (base)</p>
        
        <form onSubmit={handleSubmit}>
          {/* Mostra opções de tipo APENAS se for hambúrguer */}
          {isBurger && (
            <fieldset className={styles.options}>
              <legend>Tipo de Hambúrguer</legend>
              <label>
                <input type="radio" name="burgerType" value="bovino" checked={burgerType === 'bovino'} onChange={e => setBurgerType(e.target.value)} />
                Bovino
              </label>
              <label>
                <input type="radio" name="burgerType" value="frango" checked={burgerType === 'frango'} onChange={e => setBurgerType(e.target.value)} />
                Frango
              </label>
              <label>
                <input type="radio" name="burgerType" value="vegetariano" checked={burgerType === 'vegetariano'} onChange={e => setBurgerType(e.target.value)} />
                Vegetariano
              </label>
            </fieldset>
          )}

          {/* Mostra opções de extra (exceto para bebidas) */}
          {product.category !== 'Bebidas' && (
            <fieldset className={styles.options}>
              <legend>Extras (R$ 1,00 cada)</legend>
              <label>
                <input type="checkbox" checked={extras.queijo} onChange={() => handleExtraChange('queijo')} />
                Queijo
              </label>
              <label>
                <input type="checkbox" checked={extras.ovo} onChange={() => handleExtraChange('ovo')} />
                Ovo
              </label>
            </fieldset>
          )}

          <div className={styles.buttons}>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Adicionar ao Pedido</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;