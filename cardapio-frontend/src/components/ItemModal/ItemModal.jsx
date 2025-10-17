import { useState } from "react";
import styles from "./ItemModal.module.css";

function ItemModal({ isOpen, onClose, onSave }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(""); 
    const [imageUrl, setImageUrl] = useState("");
    const [category, setCategory] = useState("Lanches");

    if (!isOpen) {
        return null;    
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const itemData = { name, description, price: Number(price), imageUrl, category };
        
        onSave(itemData);
    };

    return ( 
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Adicionar Novo Item</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Nome do item" value={name} onChange={e => setName(e.target.value)} required />
          <textarea placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} required />
          <input type="number" placeholder="Preço" value={price} onChange={e => setPrice(e.target.value)} required />
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="Lanches">Lanches</option>
            <option value="Bebidas">Bebidas</option>
            <option value="Sobremesas">Sobremesas</option>
          </select>
          <input type="text" placeholder="URL da Imagem" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          <div className={styles.buttons}>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Salvar</button>
          </div>
        </form>
      </div>
    </div>
    );
}

export default ItemModal;