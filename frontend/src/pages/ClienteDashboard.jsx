import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ClienteDashboard = () => {
  const [prestadores, setPrestadores] = useState([]);
  const [oficioFiltro, setOficioFiltro] = useState('');
  const [listaOficios, setListaOficios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar oficios para el filtro
    fetch('http://localhost:5000/api/auth/oficios')
      .then(res => res.json())
      .then(data => { if (data.success) setListaOficios(data.oficios); });

    // Cargar prestadores registrados
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/auth/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Filtrar solo los usuarios con rol Prestador
          const soloPrestadores = data.usuarios.filter(u => u.rol === 'Prestador');
          setPrestadores(soloPrestadores);
        }
      })
      .catch(err => console.log('Error cargando prestadores', err));
  }, []);

  const prestadoresFiltrados = oficioFiltro 
    ? prestadores.filter(p => p.oficio === oficioFiltro)
    : prestadores;

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f5f1ea] p-8">
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-extrabold text-[#1b3b2c]">Panel de Clientes - OficiosYa</h1>
        <button onClick={cerrarSesion} className="bg-red-600 text-white px-4 py-2 rounded-md font-bold hover:bg-opacity-90">
          Cerrar Sesión
        </button>
      </div>

      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md mb-8">
        <label className="block text-gray-700 font-bold mb-2">Filtrar por Oficio:</label>
        <select 
          value={oficioFiltro} 
          onChange={(e) => setOficioFiltro(e.target.value)}
          className="w-full md:w-1/3 bg-[#f5f1ea] border border-gray-300 px-4 py-2 rounded-md outline-none"
        >
          <option value="">Todos los oficios</option>
          {listaOficios.map((oficio, idx) => (
            <option key={idx} value={oficio}>{oficio}</option>
          ))}
        </select>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {prestadoresFiltrados.map((p) => (
          <div key={p._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-2xl font-bold text-[#1b3b2c]">{p.nombre}</h3>
                {p.isVerified ? (
                  <span className="bg-green-100 text-green-800 text-xs font-extrabold px-3 py-1 rounded-full">
                    Sello de Confianza ✓
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-extrabold px-3 py-1 rounded-full">
                    En Revisión
                  </span>
                )}
              </div>
              <p className="text-lg text-gray-600 font-semibold mb-2">Oficio: {p.oficio}</p>
              <p className="text-gray-500 mb-4">{p.email}</p>
            </div>
            <button className="w-full bg-[#1b3b2c] text-white py-2 rounded-md font-bold hover:bg-opacity-90">
              Contratar Servicio
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClienteDashboard;