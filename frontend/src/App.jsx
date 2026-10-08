import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Registro from './pages/Registro';
import Login from './pages/Login'; 
import Onboarding from './pages/Onboarding';
import ClienteDashboard from './pages/ClienteDashboard';
import PrestadorDashboard from './pages/PrestadorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ResultadosBusqueda from './pages/ResultadosBusqueda';
import PrestadorPublicoView from './pages/PrestadorPublicoView';
import RutaProtegida from './components/RutaProtegida'; // <--- Importamos el guardia

function App() {
  return (
    <BrowserRouter>
      <Navbar /> 
      
      <div className="min-h-screen bg-[#f5f1ea] text-[#1b3b2c]">
        <Routes>
          {/* RUTAS PÚBLICAS (Accesibles para todos) */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/resultados" element={<ResultadosBusqueda />} />
          <Route path="/prestador/:id" element={<PrestadorPublicoView />} />
          
          {/* RUTAS PROTEGIDAS POR ROL */}
          <Route path="/onboarding" element={
            <RutaProtegida rolesPermitidos={['Prestador']}>
              <Onboarding />
            </RutaProtegida>
          } />
          
          <Route path="/cliente" element={
            <RutaProtegida rolesPermitidos={['Cliente']}>
              <ClienteDashboard />
            </RutaProtegida>
          } />
          
          <Route path="/prestador" element={
            <RutaProtegida rolesPermitidos={['Prestador']}>
              <PrestadorDashboard />
            </RutaProtegida>
          } />
          
          <Route path="/admin" element={
            <RutaProtegida rolesPermitidos={['Admin']}>
              <AdminDashboard />
            </RutaProtegida>
          } />
          
          {/* RUTA COMODÍN (Si escriben cualquier locura en la URL) */}
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;