import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-[#f5f1ea] px-6 py-4 flex justify-between items-center shadow-sm border-b border-gray-200">
      {/* Logotipo */}
      <div className="flex items-center gap-2">
        {/* Ícono temporal */}
        <div className="w-8 h-8 bg-[#1b3b2c] rounded-full flex items-center justify-center text-white font-bold text-lg">
          O
        </div>
        <Link to="/" className="text-2xl font-extrabold text-[#1b3b2c]">
          OficiosYa
        </Link>
      </div>

      {/* Enlaces de navegación centrales (Ocultos en pantallas muy pequeñas) */}
      <div className="hidden md:flex gap-8 text-[#1b3b2c] font-medium">
        <Link to="/" className="hover:text-gray-500 transition-colors">Servicios</Link>
        <Link to="/" className="hover:text-gray-500 transition-colors">Cómo funciona</Link>
        <Link to="/" className="hover:text-gray-500 transition-colors">Prestadores</Link>
        <Link to="/" className="hover:text-gray-500 transition-colors">Nosotros</Link>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-4 items-center">
        <Link to="/login" className="text-[#1b3b2c] font-semibold hover:text-gray-600 transition-colors">
          Iniciar sesión
        </Link>
        <Link to="/registro" className="bg-[#1b3b2c] text-white px-5 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-all">
          Regístrate gratis
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;