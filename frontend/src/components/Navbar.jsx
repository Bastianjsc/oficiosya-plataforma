import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [rolUsuario, setRolUsuario] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const nombreGuardado = localStorage.getItem('nombreUsuario');
    
    if (nombreGuardado) {
      setNombreUsuario(nombreGuardado);
    } else {
      setNombreUsuario('');
    }

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.rol) {
          setRolUsuario(payload.rol);
        }
      } catch (e) {
        setRolUsuario('');
      }
    } else {
      setRolUsuario('');
    }
  }, [location]);

  // Redirige siempre a la página principal con el buscador (/)
  const irAlInicio = () => {
    navigate('/');
  };

  const irAlPerfil = () => {
    if (rolUsuario === 'Cliente') navigate('/cliente');
    else if (rolUsuario === 'Prestador') navigate('/prestador');
    else if (rolUsuario === 'Admin') navigate('/admin');
    else navigate('/');
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombreUsuario');
    setNombreUsuario('');
    setRolUsuario('');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm py-4 px-8 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <span 
          className="text-2xl font-extrabold text-[#1b3b2c] cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={irAlInicio}
          title="Ir a la página principal"
        >
          OficiosYa
        </span>
        {rolUsuario && (
          <span className="text-xs bg-[#f5f1ea] text-[#1b3b2c] font-bold px-2.5 py-1 rounded-full uppercase">
            {rolUsuario}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {nombreUsuario ? (
          <div className="flex items-center space-x-4">
            <button 
              onClick={irAlPerfil}
              className="flex items-center space-x-2 bg-[#f5f1ea] hover:bg-gray-200 text-[#1b3b2c] px-3 py-2 rounded-full transition-all border border-gray-300"
              title="Ir a mi perfil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="font-bold text-sm hidden md:inline">{nombreUsuario}</span>
            </button>

            <button 
              onClick={cerrarSesion} 
              className="bg-red-600 hover:bg-opacity-90 text-white font-bold text-sm px-4 py-2 rounded-md transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <div className="space-x-3">
            <button 
              onClick={() => navigate('/login')} 
              className="text-[#1b3b2c] font-bold px-4 py-2 hover:underline"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => navigate('/registro')} 
              className="bg-[#1b3b2c] text-white font-bold px-4 py-2 rounded-md hover:bg-opacity-90"
            >
              Regístrate
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;