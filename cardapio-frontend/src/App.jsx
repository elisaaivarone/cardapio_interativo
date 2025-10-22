import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Order from './pages/Order/Order';
import Kitchen from './pages/Kitchen/Kitchen';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública de Login */}
        <Route path="/login" element={<Login />} />

        {/* Rota do Admin (Gerente) */}
        <Route path="/dashboard" element={ <ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>} />

        {/* Rota do Salão (Garçom) */}
        <Route path="/order" element={<ProtectedRoute role="hall"><Order /></ProtectedRoute>} />

        {/* Rota da Cozinha */}
          <Route path="/kitchen" element={<ProtectedRoute role="kitchen"><Kitchen /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>

      // Configuração do ToastContainer para notificações
      <ToastContainer 
      position="top-right" 
      autoClose={3000} 
      hideProgressBar={false} 
      newestOnTop={false} 
      closeOnClick 
      rtl={false} 
      pauseOnFocusLoss 
      draggable 
      pauseOnHover />
    </BrowserRouter>
  );
}

export default App;