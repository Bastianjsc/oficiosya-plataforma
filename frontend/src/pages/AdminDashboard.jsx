import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorVisual, setErrorVisual] = useState('');
  
  // Estados para los filtros y buscador
  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroOficio, setFiltroOficio] = useState('');
  const [listaOficios, setListaOficios] = useState([]);

  // Modal de revisión de documentos
  const [documentosModal, setDocumentosModal] = useState(null);

  const navigate = useNavigate();

  const cargarDatos = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Cargar usuarios y lista centralizada de oficios en paralelo
    Promise.all([
      fetch('http://localhost:5000/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),
      fetch('http://localhost:5000/api/auth/oficios').then(res => res.json())
    ])
      .then(([dataUsers, dataOficios]) => {
        if (dataUsers.success) {
          setUsuarios(Array.isArray(dataUsers.usuarios) ? dataUsers.usuarios : []);
        } else {
          setErrorVisual(dataUsers.message || 'No se pudieron cargar los usuarios.');
        }
        if (dataOficios.success) {
          setListaOficios(dataOficios.oficios || []);
        }
      })
      .catch((err) => {
        console.error('Error de red:', err);
        setErrorVisual('Error de conexión con el servidor.');
      })
      .finally(() => {
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const aprobarPrestador = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/auth/users/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        cargarDatos();
      } else {
        alert(data.message || 'Error al aprobar prestador.');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor', error);
    }
  };

  const eliminarCuenta = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente la cuenta de ${nombre}?`)) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/auth/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        cargarDatos();
      } else {
        alert(data.message || 'Error al eliminar usuario.');
      }
    } catch (error) {
      console.error('Error de red al eliminar', error);
    }
  };

  // Filtrado dinámico por nombre/email, tipo de perfil (rol) y tipo de oficio
  const usuariosFiltrados = usuarios.filter(u => {
    const matchTexto = busquedaTexto 
      ? u.nombre.toLowerCase().includes(busquedaTexto.toLowerCase()) || u.email.toLowerCase().includes(busquedaTexto.toLowerCase())
      : true;
    const matchRol = filtroRol ? u.rol === filtroRol : true;
    const matchOficio = filtroOficio ? u.oficio === filtroOficio : true;
    return matchTexto && matchRol && matchOficio;
  });

  return (
    <div className="min-h-screen bg-[#f5f1ea] p-8">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-[#1b3b2c] mb-6">Módulo de Auditoría y Gestión de Usuarios</h2>
        
        {/* Barra de Filtros y Buscador */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-[#f5f1ea] p-4 rounded-md border border-gray-300">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Buscar por Nombre o Correo</label>
            <input 
              type="text" 
              placeholder="Ej: Juan, @correo.com..." 
              value={busquedaTexto}
              onChange={(e) => setBusquedaTexto(e.target.value)}
              className="w-full bg-white border border-gray-300 px-3 py-2 rounded-md text-sm outline-none focus:border-[#1b3b2c]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Filtrar por Tipo de Perfil</label>
            <select 
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="w-full bg-white border border-gray-300 px-3 py-2 rounded-md text-sm outline-none focus:border-[#1b3b2c]"
            >
              <option value="">Todos los perfiles</option>
              <option value="Cliente">Cliente</option>
              <option value="Prestador">Prestador</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Filtrar por Tipo de Oficio</label>
            <select 
              value={filtroOficio}
              onChange={(e) => setFiltroOficio(e.target.value)}
              className="w-full bg-white border border-gray-300 px-3 py-2 rounded-md text-sm outline-none focus:border-[#1b3b2c]"
            >
              <option value="">Todos los oficios</option>
              {listaOficios.map((oficio, idx) => (
                <option key={idx} value={oficio}>{oficio}</option>
              ))}
            </select>
          </div>
        </div>

        {cargando && <p className="text-center text-gray-600 py-8 font-semibold">Cargando registros...</p>}
        {errorVisual && <div className="p-4 bg-red-100 text-red-800 rounded-md font-bold mb-4">{errorVisual}</div>}

        {!cargando && !errorVisual && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300 text-xs">
                  <th className="p-3 text-gray-700 font-bold">Nombre</th>
                  <th className="p-3 text-gray-700 font-bold">Correo</th>
                  <th className="p-3 text-gray-700 font-bold">Perfil</th>
                  <th className="p-3 text-gray-700 font-bold">Oficio</th>
                  <th className="p-3 text-gray-700 font-bold">Documentos</th>
                  <th className="p-3 text-gray-700 font-bold">Estado / Sello</th>
                  <th className="p-3 text-gray-700 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-gray-500 text-sm">No se encontraron usuarios con los filtros aplicados.</td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u) => (
                    <tr key={u._id} className="border-b border-gray-200 hover:bg-gray-50 text-sm">
                      <td className="p-3 font-semibold text-gray-800">{u.nombre}</td>
                      <td className="p-3 text-gray-600">{u.email}</td>
                      <td className="p-3">
                        <span className="font-bold uppercase text-xs bg-gray-200 text-gray-700 px-2.5 py-1 rounded-md">{u.rol}</span>
                      </td>
                      <td className="p-3 text-gray-700 font-medium">
                        {u.oficio ? (
                          <span className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded-md text-xs border border-blue-200">{u.oficio}</span>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="p-3">
                        {u.rol === 'Prestador' ? (
                          u.documentosIdentidad && u.documentosIdentidad.length > 0 ? (
                            <button 
                              onClick={() => setDocumentosModal(u.documentosIdentidad)}
                              className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-bold px-3 py-1.5 rounded-md transition-all border border-indigo-300"
                            >
                              Ver Archivos ({u.documentosIdentidad.length})
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 font-semibold">Sin archivos</span>
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        {u.rol === 'Prestador' ? (
                          u.isVerified ? (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-extrabold">
                              Verificado ✓
                            </span>
                          ) : (
                            <button 
                              onClick={() => aprobarPrestador(u._id)}
                              className="bg-[#1b3b2c] hover:bg-opacity-90 text-white text-xs font-bold px-3 py-1.5 rounded-md transition-all shadow-sm"
                            >
                              Aprobar Sello
                            </button>
                          )
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => eliminarCuenta(u._id, u.nombre)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-md transition-all shadow-sm"
                          title="Eliminar cuenta permanentemente"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para revisar los documentos adjuntos */}
      {documentosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full shadow-xl">
            <h3 className="text-xl font-bold text-[#1b3b2c] mb-4">Evidencia Documental del Prestador</h3>
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {documentosModal.map((doc, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-md flex justify-between items-center">
                  <span className="text-xs text-gray-700 font-mono truncate max-w-xs">{doc}</span>
                  <a 
                    href={`http://localhost:5000/${doc}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md font-bold hover:bg-blue-700"
                  >
                    Abrir Archivo
                  </a>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setDocumentosModal(null)}
              className="w-full bg-gray-700 text-white py-2 rounded-md font-bold text-sm hover:bg-gray-800"
            >
              Cerrar Ventana
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;