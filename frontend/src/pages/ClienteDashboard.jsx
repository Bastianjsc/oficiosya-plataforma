import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EstadoBadge from '../components/EstadoBadge';
import Alert from '../components/Alert';
import { generarEvidenciaPDF } from '../utils/pdfGenerator';
import FotoPerfilEditor from '../components/FotoPerfilEditor';

const ClienteDashboard = () => {
  const [perfil, setPerfil] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [filtroEstado, setFiltroEstado] = useState('Solicitados');
  const [vistaSolicitudes, setVistaSolicitudes] = useState('grilla');

  const [modalCalificacion, setModalCalificacion] = useState(null);
  const [formCalificacion, setFormCalificacion] = useState({ estrellas: 5, comentario: '' });
  const [procesando, setProcesando] = useState(false);
  const [mensajeModal, setMensajeModal] = useState({ texto: '', tipo: '' });

  const navigate = useNavigate();

  const cargarDatos = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/auth/perfil`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/marketplace/solicitudes/cliente`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json())
    ])
    .then(([dataPerfil, dataSolicitudes]) => {
      if (dataPerfil.success) setPerfil(dataPerfil.usuario);
      if (dataSolicitudes.success) setSolicitudes(dataSolicitudes.solicitudes);
    })
    .catch(err => console.error('Error cargando datos', err))
    .finally(() => setCargando(false));
  }, [navigate]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const cambiarEstadoSolicitud = async (id, nuevoEstado) => {
    let mensajeConfirmacion = `¿Estás seguro de marcar esta solicitud como ${nuevoEstado}?`;
    if (nuevoEstado === 'Aceptado') mensajeConfirmacion = 'Al aceptar, confirmas el presupuesto y se iniciará el acuerdo de trabajo. ¿Deseas continuar?';
    if (!window.confirm(mensajeConfirmacion)) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/marketplace/solicitudes/${id}/estado`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ estado: nuevoEstado })
      });
      if (response.ok) {
        cargarDatos();
        if (nuevoEstado === 'Aceptado') setFiltroEstado('En Progreso');
      }
    } catch (error) { console.error("Error al cambiar estado:", error); }
  };

  const abrirModalCalificacion = (solicitud) => {
    setModalCalificacion(solicitud);
    setFormCalificacion({ estrellas: 5, comentario: '' });
    setMensajeModal({ texto: '', tipo: '' });
  };

  const handleCalificar = async (e) => {
    e.preventDefault();
    setProcesando(true);
    setMensajeModal({ texto: 'Validando autenticidad del servicio...', tipo: 'info' });
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/marketplace/solicitudes/${modalCalificacion._id}/calificar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ estrellas: formCalificacion.estrellas, comentario: formCalificacion.comentario })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMensajeModal({ texto: data.message, tipo: 'success' });
        setTimeout(() => { setModalCalificacion(null); cargarDatos(); }, 2000);
      } else {
        setMensajeModal({ texto: data.message || 'Error al procesar calificación.', tipo: 'error' });
      }
    } catch (error) { 
      console.error("Error al calificar:", error);
      setMensajeModal({ texto: 'Error de conexión con el servidor.', tipo: 'error' }); 
    } 
    finally { setProcesando(false); }
  };

  const formatearFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });

  const solicitudesFiltradas = solicitudes.filter(sol => {
    if (filtroEstado === 'Solicitados') return sol.estado === 'Pendiente' || sol.estado === 'Cotizado';
    if (filtroEstado === 'En Progreso') return sol.estado === 'Aceptado';
    if (filtroEstado === 'Finalizados') return sol.estado === 'Finalizado' || sol.estado === 'Rechazado';
    return true;
  });

  if (cargando) return <div className="p-8 text-center text-gray-600 font-bold">Cargando tu panel...</div>;

  return (
    <div className="min-h-screen bg-[#f5f1ea] p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
<div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 sticky top-8">
            <div className="flex flex-col items-center text-center">
              
              <FotoPerfilEditor 
                perfil={perfil} 
                onActualizar={cargarDatos} 
                tema="oscuro" 
                tamaño="grande" 
              />
              
              <h2 className="text-xl font-extrabold text-[#1b3b2c] mt-4">{perfil?.nombre || 'Cargando...'}</h2>
              <p className="text-sm text-gray-500 font-bold mb-4">{perfil?.email}</p>
              
              <span className="bg-[#1b3b2c] text-[#e8c582] px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-4 shadow-sm">Cuenta de Cliente</span>
            </div>
            
            <hr className="my-6 border-gray-200" />
            <Link to="/buscar" className="w-full block text-center bg-[#1b3b2c] text-white py-2.5 rounded-md font-bold text-sm hover:bg-opacity-90 transition-all shadow-sm">Buscar un nuevo Servicio</Link>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 min-h-full flex flex-col">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-[#1b3b2c]">Mis Servicios Contratados</h2>
              <div className="hidden md:flex bg-gray-100 p-1.5 rounded">
                <button onClick={() => setVistaSolicitudes('lista')} className={`px-4 py-1.5 rounded text-sm font-bold ${vistaSolicitudes==='lista'?'bg-white shadow text-[#1b3b2c]':'text-gray-500'}`}>Lista</button>
                <button onClick={() => setVistaSolicitudes('grilla')} className={`px-4 py-1.5 rounded text-sm font-bold ${vistaSolicitudes==='grilla'?'bg-white shadow text-[#1b3b2c]':'text-gray-500'}`}>Grilla</button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button type="button" onClick={() => setFiltroEstado('Solicitados')} className={`flex-1 py-3 px-4 rounded-md border text-sm font-bold transition-all ${filtroEstado === 'Solicitados' ? 'bg-[#1b3b2c] text-white border-[#1b3b2c] shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>📋 Solicitados</button>
              <button type="button" onClick={() => setFiltroEstado('En Progreso')} className={`flex-1 py-3 px-4 rounded-md border text-sm font-bold transition-all ${filtroEstado === 'En Progreso' ? 'bg-[#1b3b2c] text-white border-[#1b3b2c] shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>⚙️ En Progreso</button>
              <button type="button" onClick={() => setFiltroEstado('Finalizados')} className={`flex-1 py-3 px-4 rounded-md border text-sm font-bold transition-all ${filtroEstado === 'Finalizados' ? 'bg-[#1b3b2c] text-white border-[#1b3b2c] shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>✅ Historial</button>
            </div>

            {solicitudesFiltradas.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center flex flex-col items-center justify-center flex-grow">
                <span className="text-4xl mb-4">{filtroEstado === 'Solicitados' ? '📋' : filtroEstado === 'En Progreso' ? '⚙️' : '✅'}</span>
                <h3 className="text-lg font-bold text-gray-600 mb-2">No tienes servicios {filtroEstado.toLowerCase()}</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  {filtroEstado === 'Solicitados' && 'Aquí verás las solicitudes que has enviado y los presupuestos por aceptar.'}
                  {filtroEstado === 'En Progreso' && 'Aquí verás los trabajos que ya acordaste y están siendo realizados.'}
                  {filtroEstado === 'Finalizados' && 'Aquí se guardará el historial de tus servicios finalizados o rechazados.'}
                </p>
              </div>
            ) : (
              <div className={vistaSolicitudes === 'lista' ? 'space-y-6' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}>
                {solicitudesFiltradas.map(sol => (
                  <div key={sol._id} className="border border-gray-200 rounded-lg p-5 bg-gray-50 hover:shadow-md transition-shadow flex flex-col h-full">
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 border border-gray-300 overflow-hidden flex-shrink-0 relative">
                          {sol.prestador?.fotoPerfil ? (
                            <img src={sol.prestador.fotoPerfil.startsWith('http') ? sol.prestador.fotoPerfil : `${import.meta.env.VITE_API_URL}/${sol.prestador.fotoPerfil}`} alt="Prestador" className="absolute inset-0 w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">{sol.prestador?.nombre?.charAt(0)}</div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[#1b3b2c] text-lg leading-tight">{sol.prestador?.tituloTienda || sol.prestador?.nombre}</h4>
                          <p className="text-xs text-gray-500 font-bold">{sol.prestador?.oficio} • {formatearFecha(sol.createdAt)}</p>
                        </div>
                      </div>
                      <EstadoBadge estado={sol.estado} />
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Tu Solicitud:</p>
                      <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">{sol.descripcionCliente}</p>
                    </div>

                    {(sol.estado === 'Cotizado' || sol.estado === 'Aceptado' || sol.estado === 'Finalizado') && sol.presupuesto && (
                      <div className="bg-[#1b3b2c] text-white p-4 rounded-md shadow-inner mb-4">
                        <h5 className="text-sm font-extrabold text-[#e8c582] mb-3 border-b border-gray-600 pb-2">Presupuesto Formal</h5>
                        {sol.presupuesto.mensajePrestador && (
                          <div className="mb-4"><span className="text-gray-300 block text-xs font-bold mb-1">Descripción del Trabajo:</span><p className="bg-white/10 p-3 rounded text-sm text-gray-100 whitespace-pre-wrap leading-relaxed">{sol.presupuesto.mensajePrestador}</p></div>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div><span className="text-gray-300 block text-xs">Mano de Obra:</span><span className="font-bold">${sol.presupuesto.manoDeObra}</span></div>
                          <div><span className="text-gray-300 block text-xs">Materiales:</span><span className="font-bold">${sol.presupuesto.materiales}</span></div>
                        </div>
                        <div className="text-right text-lg border-t border-gray-600 pt-3 mt-3">
                          <span className="text-sm text-gray-300 mr-2">Total a Pagar:</span><span className="font-extrabold text-[#e8c582]">${sol.presupuesto.manoDeObra + sol.presupuesto.materiales}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap justify-end gap-3 mt-auto pt-4">
                      {sol.estado === 'Cotizado' && (
                        <><button onClick={() => cambiarEstadoSolicitud(sol._id, 'Rechazado')} className="px-4 py-2 rounded-md text-sm font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-all">Rechazar</button><button onClick={() => cambiarEstadoSolicitud(sol._id, 'Aceptado')} className="px-4 py-2 rounded-md text-sm font-bold text-white bg-[#1b3b2c] hover:bg-opacity-90 shadow-md transition-all">Aceptar Presupuesto</button></>
                      )}
                      {(sol.estado === 'Aceptado' || sol.estado === 'Finalizado') && (
                        <button onClick={() => generarEvidenciaPDF(sol)} className="px-4 py-2 rounded-md text-sm font-bold text-[#1b3b2c] bg-white border border-gray-300 hover:bg-gray-100 shadow-sm transition-all">📄 Descargar PDF</button>
                      )}
                      
                      {sol.estado === 'Finalizado' && !sol.calificacion?.estrellas && (
                        <button onClick={() => abrirModalCalificacion(sol)} className="px-4 py-2 rounded-md text-sm font-extrabold text-[#1b3b2c] bg-[#e8c582] hover:bg-[#d4b068] hover:shadow-md transition-all duration-200 flex items-center gap-2">⭐ Calificar al Técnico</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modalCalificacion && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50 transition-all">
          <div className="bg-white p-8 rounded-lg max-w-md w-full shadow-2xl relative">
            <button onClick={() => setModalCalificacion(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-3xl font-bold leading-none outline-none">&times;</button>
            <h3 className="text-2xl font-extrabold text-[#1b3b2c] mb-1">Calificar Servicio</h3>
            <p className="text-sm text-gray-600 mb-6">Evalúa el trabajo realizado por <span className="font-bold">{modalCalificacion.prestador?.nombre}</span>. Tu opinión es vital para la comunidad.</p>
            <Alert mensaje={mensajeModal} tipo={mensajeModal.tipo} />
            <form onSubmit={handleCalificar} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 text-center">Nivel de Satisfacción (Estrellas)</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setFormCalificacion({...formCalificacion, estrellas: star})} className={`text-4xl focus:outline-none transition-transform hover:scale-110 ${star <= formCalificacion.estrellas ? 'text-[#e8c582]' : 'text-gray-300'}`}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Comentario Público</label>
                <textarea required rows="3" value={formCalificacion.comentario} onChange={(e) => setFormCalificacion({...formCalificacion, comentario: e.target.value})} className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-3 rounded-md outline-none focus:border-[#1b3b2c] resize-none" placeholder="Describe qué tal fue el servicio, puntualidad, limpieza..."></textarea>
              </div>
              <button type="submit" className="w-full py-3 rounded-md font-extrabold text-[#1b3b2c] bg-[#e8c582] hover:bg-opacity-90 shadow-md transition-all" disabled={procesando}>{procesando ? 'Procesando reseña...' : 'Publicar Reseña'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClienteDashboard;