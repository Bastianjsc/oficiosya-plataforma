import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import InsigniaVerificada from '../components/InsigniaVerificada';
import FotoPerfilEditor from '../components/FotoPerfilEditor';

const AdminDashboard = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorVisual, setErrorVisual] = useState('');
  
  const [adminActual, setAdminActual] = useState(null);
  
  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroOficio, setFiltroOficio] = useState('');
  const [filtroVerificacion, setFiltroVerificacion] = useState('');

  const [listaOficios, setListaOficios] = useState([]);
  const [documentosModal, setDocumentosModal] = useState(null);

  const navigate = useNavigate();

  const cargarDatos = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    Promise.all([
      fetch('${import.meta.env.VITE_API_URL}/api/auth/users', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
      fetch('${import.meta.env.VITE_API_URL}/api/auth/oficios').then(res => res.json()),
      fetch('${import.meta.env.VITE_API_URL}/api/auth/perfil', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json())
    ])
      .then(([dataUsers, dataOficios, dataPerfil]) => {
        if (dataUsers.success) setUsuarios(Array.isArray(dataUsers.usuarios) ? dataUsers.usuarios : []);
        else setErrorVisual(dataUsers.message || 'No se pudieron cargar los usuarios.');
        
        if (dataOficios.success) setListaOficios(dataOficios.oficios || []);
        if (dataPerfil.success) setAdminActual(dataPerfil.usuario);
      })
      .catch((err) => {
        console.error('Error de red:', err);
        setErrorVisual('Error de conexión con el servidor.');
      })
      .finally(() => setCargando(false));
  }, [navigate]);

  useEffect(() => { 
    cargarDatos(); 
  }, [cargarDatos]);

  const aprobarPrestador = async (id) => {
    if (!window.confirm('¿Confirmas que los documentos son válidos y deseas otorgar la insignia de verificación?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/users/${id}/verify`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      if (response.ok && data.success) cargarDatos();
      else alert(data.message || 'Error al aprobar prestador.');
    } catch (error) { console.error('Error al conectar con el servidor', error); }
  };

  const eliminarCuenta = async (id, nombre) => {
    if (!window.confirm(`¿Estás ABSOLUTAMENTE seguro de que deseas eliminar la cuenta de ${nombre}?`)) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      if (response.ok && data.success) cargarDatos();
      else alert(data.message || 'Error al eliminar usuario.');
    } catch (error) { console.error('Error de red al eliminar', error); }
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const matchTexto = busquedaTexto ? u.nombre.toLowerCase().includes(busquedaTexto.toLowerCase()) || u.email.toLowerCase().includes(busquedaTexto.toLowerCase()) : true;
    const matchRol = filtroRol ? u.rol === filtroRol : true;
    const matchOficio = filtroOficio ? u.oficio === filtroOficio : true;
    
    let matchVerificacion = true;
    if (filtroVerificacion) {
      if (filtroVerificacion === 'No Aplica') matchVerificacion = u.rol !== 'Prestador';
      else if (filtroVerificacion === 'Verificado') matchVerificacion = u.rol === 'Prestador' && u.isVerified === true;
      else if (filtroVerificacion === 'Listo para Aprobar') matchVerificacion = u.rol === 'Prestador' && u.isVerified === false && u.documentosIdentidad && u.documentosIdentidad.length > 0;
      else if (filtroVerificacion === 'Sin Documentos') matchVerificacion = u.rol === 'Prestador' && u.isVerified === false && (!u.documentosIdentidad || u.documentosIdentidad.length === 0);
    }
    return matchTexto && matchRol && matchOficio && matchVerificacion;
  });

  return (
    <div className="min-h-screen bg-[#f5f1ea] flex flex-col">
      <div className="bg-[#1b3b2c] border-b-4 border-[#e8c582] shadow-md z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <FotoPerfilEditor 
              perfil={adminActual} 
              onActualizar={cargarDatos} 
              tema="oscuro" 
              tamaño="pequeño" 
            />
            <div>
              <h2 className="text-xl font-extrabold text-white leading-tight">{adminActual ? adminActual.nombre : 'Cargando...'}</h2>
              <p className="text-[#e8c582] text-xs font-bold tracking-wider uppercase">Panel de Administración</p>
            </div>
          </div>
          <nav className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <button 
              onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('nombreUsuario'); navigate('/login'); }} 
              className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-md text-sm whitespace-nowrap transition-all shadow-sm flex items-center gap-2"
            >
              Cerrar Sesión
            </button>
          </nav>
        </div>
      </div>

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-[#1b3b2c]">Módulo de Auditoría y Gestión</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Revisa perfiles, filtra resultados y verifica credenciales.</p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-4 text-sm font-bold text-[#1b3b2c] bg-gray-50 px-4 py-2 rounded-md border border-gray-200">
               <div>Usuarios: {usuarios.length}</div>
               <div className="w-px bg-gray-300"></div>
               <div>Pendientes: {usuarios.filter(u => u.rol === 'Prestador' && !u.isVerified && u.documentosIdentidad?.length > 0).length}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-gray-50 p-5 rounded-md border border-gray-200 shadow-sm">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Buscar Usuario</label>
              <input type="text" placeholder="Ej: Juan, @correo.com..." value={busquedaTexto} onChange={(e) => setBusquedaTexto(e.target.value)} className="w-full bg-white border border-gray-300 px-4 py-2.5 rounded-md text-sm outline-none focus:border-[#1b3b2c] shadow-inner" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Perfil</label>
              <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} className="w-full bg-white border border-gray-300 px-4 py-2.5 rounded-md text-sm outline-none focus:border-[#1b3b2c] shadow-inner">
                <option value="">Todos los perfiles</option><option value="Cliente">Cliente</option><option value="Prestador">Prestador</option><option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Oficio</label>
              <select value={filtroOficio} onChange={(e) => setFiltroOficio(e.target.value)} className="w-full bg-white border border-gray-300 px-4 py-2.5 rounded-md text-sm outline-none focus:border-[#1b3b2c] shadow-inner">
                <option value="">Todos los oficios</option>
                {listaOficios.map((oficio, idx) => <option key={idx} value={oficio}>{oficio}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Verificación</label>
              <select value={filtroVerificacion} onChange={(e) => setFiltroVerificacion(e.target.value)} className="w-full bg-white border border-gray-300 px-4 py-2.5 rounded-md text-sm outline-none focus:border-[#1b3b2c] shadow-inner font-semibold text-[#1b3b2c]">
                <option value="">Todos los estados</option><option value="Verificado">Verificados</option><option value="Listo para Aprobar">Listos para Aprobar</option><option value="Sin Documentos">Sin Documentos</option><option value="No Aplica">No Aplica</option>
              </select>
            </div>
          </div>

          {cargando && <div className="flex justify-center items-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#1b3b2c]"></div></div>}
          {errorVisual && <div className="p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-r-md font-bold mb-4">{errorVisual}</div>}

          {!cargando && !errorVisual && (
            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300 text-[11px] uppercase tracking-wider">
                    <th className="p-4 text-gray-600 font-extrabold">Nombre del Usuario</th><th className="p-4 text-gray-600 font-extrabold">Perfil</th><th className="p-4 text-gray-600 font-extrabold">Oficio</th><th className="p-4 text-gray-600 font-extrabold text-center">Documentos Legales</th><th className="p-4 text-gray-600 font-extrabold text-center">Verificación</th><th className="p-4 text-gray-600 font-extrabold text-center">Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {usuariosFiltrados.length === 0 ? (
                    <tr><td colSpan="6" className="p-10 text-center text-gray-500 font-bold bg-gray-50 text-lg">No se encontraron usuarios.</td></tr>
                  ) : (
                    usuariosFiltrados.map((u) => (
                      <tr key={u._id} className="hover:bg-blue-50 transition-colors bg-white group">
                        <td className="p-4">
                          <div className="font-extrabold text-[#1b3b2c] flex items-center gap-1.5 text-sm">{u.nombre}{u.rol === 'Prestador' && u.isVerified && <InsigniaVerificada className="w-4 h-4" />}</div>
                          <div className="text-xs text-gray-500 font-medium mt-0.5">{u.email}</div>
                        </td>
                        <td className="p-4"><span className={`font-extrabold uppercase text-[10px] px-2.5 py-1 rounded shadow-sm ${u.rol === 'Admin' ? 'bg-purple-100 text-purple-800 border-purple-200' : u.rol === 'Prestador' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>{u.rol}</span></td>
                        <td className="p-4 text-xs font-semibold text-gray-700">{u.oficio ? u.oficio : <span className="text-gray-400 italic font-medium">No aplica</span>}</td>
                        <td className="p-4 text-center">
                          {u.rol === 'Prestador' ? (u.documentosIdentidad && u.documentosIdentidad.length > 0 ? <button onClick={() => setDocumentosModal(u.documentosIdentidad)} className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded border border-indigo-200 shadow-sm">Ver Doc(s)</button> : <span className="text-xs text-red-600 font-bold bg-red-50 border border-red-200 px-2.5 py-1 rounded">Sin Docs</span>) : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="p-4 text-center">
                          {u.rol === 'Prestador' ? (u.isVerified ? <div className="inline-flex items-center justify-center bg-gray-100 rounded-full px-2 py-1 shadow-sm border border-gray-200"><InsigniaVerificada className="w-5 h-5" /></div> : <button onClick={() => aprobarPrestador(u._id)} disabled={!u.documentosIdentidad || u.documentosIdentidad.length === 0} className={`text-[11px] font-extrabold px-3 py-1.5 rounded shadow-sm uppercase ${u.documentosIdentidad && u.documentosIdentidad.length > 0 ? 'bg-[#1b3b2c] text-[#e8c582]' : 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300'}`}>Aprobar</button>) : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => eliminarCuenta(u._id, u.nombre)} className="bg-white hover:bg-red-50 text-red-600 border border-red-200 text-[11px] uppercase tracking-wide font-extrabold px-3 py-1.5 rounded shadow-sm opacity-50 group-hover:opacity-100">Eliminar</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {documentosModal && (
        <div className="fixed inset-0 bg-[#1b3b2c] bg-opacity-80 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full shadow-2xl border-t-4 border-[#e8c582]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
              <h3 className="text-xl font-extrabold text-[#1b3b2c]">Auditoría de Documentos</h3>
              <button onClick={() => setDocumentosModal(null)} className="text-gray-400 hover:text-red-500 text-2xl leading-none font-bold">&times;</button>
            </div>
            <p className="text-sm text-gray-600 mb-4 font-medium leading-relaxed">Archivos subidos por el prestador para respaldar su identidad (Ley 19.628). Su descarga o almacenamiento externo está prohibido.</p>
            <div className="space-y-3 mb-6 max-h-[50vh] overflow-y-auto pr-2">
              {documentosModal.map((doc, idx) => (
                <div key={idx} className="p-4 bg-[#f5f1ea] border border-gray-300 rounded-md flex justify-between items-center shadow-sm">
                  <span className="text-sm text-[#1b3b2c] font-extrabold truncate max-w-[200px]" title={doc}>📄 Evidencia_{idx + 1}</span>
                  <a href={`http://localhost:5000/${doc}`} target="_blank" rel="noopener noreferrer" className="text-xs bg-[#1b3b2c] text-[#e8c582] px-4 py-2 rounded font-extrabold hover:bg-opacity-90 shadow-sm transition-all">Visualizar ↗</a>
                </div>
              ))}
            </div>
            <button onClick={() => setDocumentosModal(null)} className="w-full bg-gray-200 text-gray-800 py-3 rounded font-extrabold text-sm hover:bg-gray-300 transition-colors shadow-sm">Cerrar Visor</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;