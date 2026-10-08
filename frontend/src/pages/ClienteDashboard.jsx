import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ClienteDashboard = () => {
  const [perfil, setPerfil] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [modalCalificacion, setModalCalificacion] = useState(null);
  const [formCalificacion, setFormCalificacion] = useState({ estrellas: 5, comentario: '' });
  const [procesando, setProcesando] = useState(false);
  const [mensajeModal, setMensajeModal] = useState({ texto: '', tipo: '' });

  const navigate = useNavigate();

  const cargarDatos = () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    Promise.all([
      fetch('http://localhost:5000/api/auth/perfil', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
      fetch('http://localhost:5000/api/marketplace/solicitudes/cliente', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json())
    ])
    .then(([dataPerfil, dataSolicitudes]) => {
      if (dataPerfil.success) setPerfil(dataPerfil.usuario);
      if (dataSolicitudes.success) setSolicitudes(dataSolicitudes.solicitudes);
    })
    .catch(err => console.error('Error cargando datos', err))
    .finally(() => setCargando(false));
  };

  useEffect(() => { cargarDatos(); }, [navigate]);

  const cambiarEstadoSolicitud = async (id, nuevoEstado) => {
    let mensajeConfirmacion = `¿Estás seguro de marcar esta solicitud como ${nuevoEstado}?`;
    if (nuevoEstado === 'Aceptado') {
      mensajeConfirmacion = 'Al aceptar, confirmas el presupuesto y se iniciará el acuerdo de trabajo. ¿Deseas continuar?';
    }

    if (!window.confirm(mensajeConfirmacion)) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/marketplace/solicitudes/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        cargarDatos();
      } else {
        alert(data.message || 'Error al actualizar la solicitud.');
      }
    } catch (error) {
      console.error(error);
    }
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
      const response = await fetch(`http://localhost:5000/api/marketplace/solicitudes/${modalCalificacion._id}/calificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ estrellas: formCalificacion.estrellas, comentario: formCalificacion.comentario })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMensajeModal({ texto: data.message, tipo: 'success' });
        setTimeout(() => {
          setModalCalificacion(null);
          cargarDatos();
        }, 2000);
      } else {
        setMensajeModal({ texto: data.message || 'Error al procesar calificación.', tipo: 'error' });
      }
    } catch (error) {
      setMensajeModal({ texto: 'Error de conexión con el servidor.', tipo: 'error' });
    } finally {
      setProcesando(false);
    }
  };

  const getBadgeColor = (estado) => {
    switch(estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Cotizado': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Aceptado': return 'bg-green-100 text-green-800 border-green-300';
      case 'Rechazado': return 'bg-red-100 text-red-800 border-red-300';
      case 'Finalizado': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatearFecha = (fechaISO) => {
    return new Date(fechaISO).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
  };

  if (cargando) return <div className="p-8 text-center text-gray-600 font-bold">Cargando tu panel...</div>;

  return (
    <div className="min-h-screen bg-[#f5f1ea] p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 sticky top-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#1b3b2c] text-white rounded-full flex items-center justify-center text-4xl font-extrabold mb-4 shadow-inner">
                {perfil?.nombre?.charAt(0)}
              </div>
              <h2 className="text-xl font-extrabold text-[#1b3b2c]">{perfil?.nombre}</h2>
              <p className="text-sm text-gray-500 font-bold mb-4">{perfil?.email}</p>
              <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                Cuenta de Cliente
              </span>
            </div>
            
            <hr className="my-6 border-gray-200" />
            
            <Link to="/" className="w-full block text-center bg-[#1b3b2c] text-white py-2.5 rounded-md font-bold text-sm hover:bg-opacity-90 transition-all shadow-sm">
              Buscar un nuevo Servicio
            </Link>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 min-h-full">
            <h2 className="text-2xl font-extrabold text-[#1b3b2c] mb-6">Mis Servicios Contratados</h2>
            
            {solicitudes.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-bold text-gray-600 mb-2">Aún no tienes servicios activos</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Cuando contactes a un prestador y acuerdes un trabajo, el historial y estado de tus solicitudes aparecerán aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {solicitudes.map(sol => (
                  <div key={sol._id} className="border border-gray-200 rounded-lg p-5 bg-gray-50 hover:shadow-md transition-shadow">
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 border border-gray-300 overflow-hidden flex-shrink-0">
                          {sol.prestador?.fotoPerfil ? (
                            <img src={sol.prestador.fotoPerfil.startsWith('http') ? sol.prestador.fotoPerfil : `http://localhost:5000/${sol.prestador.fotoPerfil}`} alt="Prestador" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">{sol.prestador?.nombre?.charAt(0)}</div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[#1b3b2c] text-lg leading-tight">{sol.prestador?.tituloTienda || sol.prestador?.nombre}</h4>
                          <p className="text-xs text-gray-500 font-bold">{sol.prestador?.oficio} • {formatearFecha(sol.createdAt)}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-sm ${getBadgeColor(sol.estado)}`}>
                        {sol.estado}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Tu Solicitud:</p>
                      <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">{sol.descripcionCliente}</p>
                    </div>

                    {(sol.estado === 'Cotizado' || sol.estado === 'Aceptado' || sol.estado === 'Finalizado') && sol.presupuesto && (
                      <div className="bg-[#1b3b2c] text-white p-4 rounded-md shadow-inner mb-4">
                        <h5 className="text-sm font-extrabold text-[#e8c582] mb-3 border-b border-gray-600 pb-2">Presupuesto Formal</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div><span className="text-gray-300 block text-xs">Mano de Obra:</span><span className="font-bold">${sol.presupuesto.manoDeObra}</span></div>
                          <div><span className="text-gray-300 block text-xs">Materiales:</span><span className="font-bold">${sol.presupuesto.materiales}</span></div>
                        </div>
                        {sol.presupuesto.mensajePrestador && (
                          <div className="bg-white/10 p-2 rounded text-xs text-gray-200 italic mb-3">"{sol.presupuesto.mensajePrestador}"</div>
                        )}
                        <div className="text-right text-lg">
                          <span className="text-sm text-gray-300 mr-2">Total a Pagar:</span>
                          <span className="font-extrabold text-[#e8c582]">${sol.presupuesto.manoDeObra + sol.presupuesto.materiales}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 mt-2">
                      {sol.estado === 'Cotizado' && (
                        <>
                          <button onClick={() => cambiarEstadoSolicitud(sol._id, 'Rechazado')} className="px-4 py-2 rounded-md text-sm font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-all">Rechazar</button>
                          <button onClick={() => cambiarEstadoSolicitud(sol._id, 'Aceptado')} className="px-4 py-2 rounded-md text-sm font-bold text-white bg-[#1b3b2c] hover:bg-opacity-90 shadow-md transition-all">Aceptar Presupuesto</button>
                        </>
                      )}
                      
                      {sol.estado === 'Aceptado' && (
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-2 rounded border border-green-200 flex items-center">
                          ✓ Trabajo en progreso. El técnico marcará el fin del servicio.
                        </span>
                      )}

                      {sol.estado === 'Finalizado' && !sol.calificacion?.estrellas && (
                        <button 
                          onClick={() => abrirModalCalificacion(sol)} 
                          className="px-4 py-2 rounded-md text-sm font-extrabold text-[#1b3b2c] bg-[#e8c582] hover:bg-opacity-90 shadow-md transition-all flex items-center gap-2"
                        >
                          ⭐ Calificar al Técnico
                        </button>
                      )}

                      {sol.estado === 'Finalizado' && sol.calificacion?.estrellas && (
                         <span className="text-xs font-bold text-gray-600 bg-gray-200 px-3 py-2 rounded border border-gray-300 flex items-center">
                           Servicio Calificado ({sol.calificacion.estrellas} ⭐)
                         </span>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE CALIFICACIÓN (Difuminado) */}
      {modalCalificacion && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50 transition-all">
          <div className="bg-white p-8 rounded-lg max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setModalCalificacion(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-3xl font-bold leading-none outline-none"
            >
              &times;
            </button>

            <h3 className="text-2xl font-extrabold text-[#1b3b2c] mb-1">Calificar Servicio</h3>
            <p className="text-sm text-gray-600 mb-6">Evalúa el trabajo realizado por <span className="font-bold">{modalCalificacion.prestador?.nombre}</span>. Tu opinión es vital para la comunidad.</p>

            {mensajeModal.texto && (
              <div className={`p-4 mb-6 rounded-md text-sm font-bold ${mensajeModal.tipo === 'success' ? 'bg-green-100 text-green-800' : (mensajeModal.tipo === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800')}`}>
                {mensajeModal.texto}
              </div>
            )}

            <form onSubmit={handleCalificar} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 text-center">Nivel de Satisfacción (Estrellas)</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormCalificacion({...formCalificacion, estrellas: star})}
                      className={`text-4xl focus:outline-none transition-transform hover:scale-110 ${star <= formCalificacion.estrellas ? 'text-[#e8c582]' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Comentario Público</label>
                <textarea 
                  required
                  rows="3"
                  value={formCalificacion.comentario}
                  onChange={(e) => setFormCalificacion({...formCalificacion, comentario: e.target.value})}
                  className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-3 rounded-md outline-none focus:border-[#1b3b2c] resize-none" 
                  placeholder="Describe qué tal fue el servicio, puntualidad, limpieza..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 rounded-md font-extrabold text-[#1b3b2c] bg-[#e8c582] hover:bg-opacity-90 shadow-md transition-all"
                disabled={procesando}
              >
                {procesando ? 'Procesando reseña...' : 'Publicar Reseña'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClienteDashboard;