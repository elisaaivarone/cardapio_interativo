import React from "react";

import styles from "./ConfirmToast.module.css";

function ConfirmToast({ closeToast, onConfirm, message }) {
  return (
    <div className={styles.confirmToast}>
      <p>{message}</p>
      <div className={styles.buttonGroup}>
        <button 
          onClick={() => {
            onConfirm(); // Executa a ação (ex: deletar)
            closeToast(); // Fecha o toast
          }}
          className={`${styles.button} ${styles.confirm}`} 
        >
          Sim, Deletar
        </button>
        <button 
          onClick={closeToast} // Apenas fecha o toast
          className={`${styles.button} ${styles.cancel}`}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default ConfirmToast;