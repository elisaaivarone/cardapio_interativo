import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Order from './pages/Order/Order';
import Kitchen from './pages/Kitchen/Kitchen';
import ProtectedRoute from './components/ProtectedRoute';
import Cashier from './pages/Cashier/Cashier';
import Settings from './pages/Settings/Settings';
import RegisterInvite from './pages/Register/RegisterInvite';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-invite" element={<RegisterInvite />} />

          {/* Rota do Admin (Gerente) */}
          <Route path="/dashboard" element={ <ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>} />

          {/* Rota do Salão (Garçom) */}
          <Route path="/order" element={<ProtectedRoute role="hall"><Order /></ProtectedRoute>} />

          {/* Rota da Cozinha */}
          <Route path="/kitchen" element={<ProtectedRoute role="kitchen"><Kitchen /></ProtectedRoute>} />

          {/* Rota do Caixa */}
          <Route path="/financeiro" element={<ProtectedRoute role="admin"><Cashier /></ProtectedRoute>} />

          <Route path="/equipe" element={<ProtectedRoute role={['admin', 'Administrador','hall', 'kitchen']}><Settings /></ProtectedRoute>} />

          {/* Rota Padrão (Redirecionar) */}
          <Route path="*" element={<Navigate to="/login" />} />
            
          
        </Routes>

        {/* Configuração do ToastContainer para notificações */}
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false} 
          newestOnTop={false} 
          closeOnClick 
          rtl={false} 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
        />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;