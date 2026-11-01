import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const nombreUsuario = localStorage.getItem('nombreUsuario') || 'Mi Cuenta';

  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const dropdownRef = useRef(null);

  let dashboardRoute = '/cliente';
  if (token) {
      try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.rol === 'Prestador') dashboardRoute = '/prestador';
          if (payload.rol === 'Admin') dashboardRoute = '/admin';
      } catch (err) { console.error(err); }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombreUsuario');
    setNotificaciones([]);
    navigate('/login');
  };

  useEffect(() => {
    const fetchNotificaciones = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/notificaciones`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setNotificaciones(data.notificaciones);
      } catch (e) { console.error(e); }
    };
    fetchNotificaciones();
    const interval = setInterval(fetchNotificaciones, 15000); 
    return () => clearInterval(interval);
  }, [token, location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setMostrarNotificaciones(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función al pasar el mouse (hover)
  const marcarComoLeida = async (id) => {
    const notif = notificaciones.find(n => n._id === id);
    if (notif && !notif.leida) {
        setNotificaciones(prev => prev.map(n => n._id === id ? { ...n, leida: true } : n));
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/auth/notificaciones/${id}/leer`, {
                method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch(e) { console.error(e); }
    }
  };

  const noLeidas = notificaciones.filter(n => !n.leida).length;
  const ultimasTres = notificaciones.slice(0, 3); // Límite de 3 para la campana

  return (
    <nav className="bg-[#1b3b2c] text-white px-8 py-4 shadow-md sticky top-0 z-50 border-b-2 border-[#e8c582]">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold text-[#e8c582] tracking-wide">OficiosYa</Link>
        <div className="flex items-center gap-6 font-semibold text-sm">
          <Link to="/" className="hover:text-[#e8c582] transition-colors hidden sm:block">Inicio</Link>
          <Link to="/buscar" className="hover:text-[#e8c582] transition-colors hidden sm:block">Buscar Servicios</Link>
          
          {token ? (
            <div className="flex items-center gap-5">
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)} className="relative p-2 text-gray-300 hover:text-white transition-colors focus:outline-none">
                  <span className="text-2xl">🔔</span>
                  {noLeidas > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-extrabold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#1b3b2c] animate-bounce">
                      {noLeidas}
                    </span>
                  )}
                </button>

                {mostrarNotificaciones && (
                  <div className="absolute right-[-60px] sm:right-0 mt-3 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50">
                    <div className="bg-gray-100 px-4 py-3 font-extrabold text-gray-700 text-sm border-b flex justify-between items-center">
                      <span>Recientes</span>
                    </div>
                    
                    <div>
                      {ultimasTres.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <span className="text-3xl block mb-2">📭</span>
                          <p className="text-sm font-bold">Todo al día.</p>
                        </div>
                      ) : (
                        ultimasTres.map(n => (
                          <Link
                            key={n._id}
                            to={n.ruta}
                            onMouseEnter={() => marcarComoLeida(n._id)}
                            onClick={() => setMostrarNotificaciones(false)}
                            className={`block p-4 border-b transition-colors ${n.leida ? 'bg-white text-gray-500' : 'bg-[#f5f1ea] border-l-4 border-l-[#e8c582] text-gray-800'}`}
                          >
                            <p className={`text-sm ${n.leida ? 'font-medium' : 'font-extrabold'}`}>{n.texto}</p>
                          </Link>
                        ))
                      )}
                    </div>
                    
                    {/* Botón para ver todas */}
                    <div className="bg-gray-50 p-2 text-center border-t border-gray-200">
                      <Link to="/notificaciones" onClick={() => setMostrarNotificaciones(false)} className="text-xs font-bold text-[#1b3b2c] hover:underline">
                        Ver todas las notificaciones →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link to={dashboardRoute} className="bg-[#e8c582] text-[#1b3b2c] px-4 py-2 rounded-md font-extrabold hover:bg-opacity-90 transition-all">{nombreUsuario}</Link>
              <button onClick={handleLogout} className="text-gray-300 hover:text-red-400 transition-colors">Salir</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 rounded-md hover:bg-white/10 transition-all">Iniciar Sesión</Link>
              <Link to="/registro" className="bg-[#e8c582] text-[#1b3b2c] px-4 py-2 rounded-md font-extrabold hover:bg-opacity-90 transition-all">Registrarse</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;