import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ResultadosBusqueda from './pages/ResultadosBusqueda';
import PrestadorPublicoView from './pages/PrestadorPublicoView';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Onboarding from './pages/Onboarding';
import ClienteDashboard from './pages/ClienteDashboard';
import PrestadorDashboard from './pages/PrestadorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotificacionesView from './pages/NotificacionesView';
import RutaProtegida from './components/RutaProtegida';

// --- IMPORTACIONES DEL FLUJO DE CORREOS Y CONTRASEÑA ---
import VerificacionCorreo from './pages/VerificacionCorreo';
import RecuperarPassword from './pages/RecuperarPassword';
import RestablecerPassword from './pages/RestablecerPassword';

// --- COMPONENTE DE OPTIMIZACIÓN DE UX ---
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      {/* 
        El ScrollToTop se encarga de que, al cambiar de ruta 
        (ej. al hacer clic en enlaces del footer), 
        la vista siempre vuelva a la parte superior de la página. 
      */}
      <ScrollToTop />
      
      <Routes>
        <Route element={<Layout />}>
          {/* --- RUTAS PÚBLICAS PRINCIPALES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/buscar" element={<ResultadosBusqueda />} />
          <Route path="/prestador/:id" element={<PrestadorPublicoView />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          
          {/* --- RUTAS PÚBLICAS PARA SIMULACIÓN DE FLUJO DE CORREO --- */}
          <Route path="/verificar-correo" element={<VerificacionCorreo />} />
          <Route path="/recuperar-password" element={<RecuperarPassword />} />
          <Route path="/restablecer-password" element={<RestablecerPassword />} />

          {/* --- RUTAS PROTEGIDAS (Requieren Token JWT) --- */}
          <Route element={<RutaProtegida />}>
            <Route path="/cliente" element={<ClienteDashboard />} />
            <Route path="/prestador" element={<PrestadorDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/notificaciones" element={<NotificacionesView />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;