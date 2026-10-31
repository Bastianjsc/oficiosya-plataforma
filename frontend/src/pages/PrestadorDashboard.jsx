import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMUNAS_RM } from '../data/comunas';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import InsigniaVerificada from '../components/InsigniaVerificada';
import ResenaView from '../components/ResenaView';
import FotoPerfilEditor from '../components/FotoPerfilEditor';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 16, { animate: true, duration: 1.5 }); }, [center, map]);
  return null;
};

const MapPicker = ({ setCoords }) => {
  useMapEvents({ click(e) { setCoords(e.latlng.lat, e.latlng.lng); } });
  return null;
};

const PrestadorDashboard = () => {
  const [prestador, setPrestador] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  
  const [vistaSolicitudes, setVistaSolicitudes] = useState('mosaico2'); 
  const [filtroEstadoSolicitud, setFiltroEstadoSolicitud] = useState('');

  const [formData, setFormData] = useState({
    tituloTienda: '', biografia: '', tarifaReferencia: '', zonaCobertura: [], tipoAtencion: 'A domicilio', localesFisicos: []
  });
  
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [modalCotizacion, setModalCotizacion] = useState(null);
  const [formCotizacion, setFormCotizacion] = useState({ manoDeObra: '', materiales: '', mensajePrestador: '' });
  const [procesando, setProcesando] = useState(false);
  const [mostrarModalResenas, setMostrarModalResenas] = useState(false);
  const [buscandoMapa, setBuscandoMapa] = useState(false);

  const navigate = useNavigate();

  const cargarDatos = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    Promise.all([
      fetch('${import.meta.env.VITE_API_URL}/api/auth/perfil', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
      fetch('${import.meta.env.VITE_API_URL}/api/marketplace/solicitudes/prestador', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json())
    ])
    .then(([dataPerfil, dataSolicitudes]) => {
      if (dataPerfil.success) {
        setPrestador(dataPerfil.usuario);
        const localesMapeados = (dataPerfil.usuario.localesFisicos || []).map(loc => ({
          nombreLocal: loc.nombreLocal || '',
          direccion: loc.direccion || '',
          numero: loc.numero || '', 
          comuna: loc.comuna || '',
          lat: loc.ubicacion?.coordinates[1] || -33.4372,
          lng: loc.ubicacion?.coordinates[0] || -70.6506
        }));

        setFormData({
          tituloTienda: dataPerfil.usuario.tituloTienda || '',
          biografia: dataPerfil.usuario.biografia || '',
          tarifaReferencia: dataPerfil.usuario.tarifaReferencia || '',
          zonaCobertura: dataPerfil.usuario.zonaCobertura || [],
          tipoAtencion: dataPerfil.usuario.tipoAtencion || 'A domicilio',
          localesFisicos: localesMapeados
        });
      }
      if (dataSolicitudes.success) setSolicitudes(dataSolicitudes.solicitudes);
    })
    .catch(err => console.error('Error cargando datos:', err))
    .finally(() => setCargando(false));
  }, [navigate]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleAgregarComuna = (e) => {
    const val = e.target.value;
    if (val && !formData.zonaCobertura.includes(val)) setFormData({ ...formData, zonaCobertura: [...formData.zonaCobertura, val] });
    e.target.value = "";
  };
  const handleRemoverComuna = (val) => setFormData({ ...formData, zonaCobertura: formData.zonaCobertura.filter(c => c !== val) });

  const agregarLocal = () => { setFormData({ ...formData, localesFisicos: [...formData.localesFisicos, { nombreLocal: '', direccion: '', numero: '', comuna: '', lat: -33.4372, lng: -70.6506 }] }); };
  const removerLocal = (index) => { const nuevos = [...formData.localesFisicos]; nuevos.splice(index, 1); setFormData({ ...formData, localesFisicos: nuevos }); };
  const handleLocalChange = (index, campo, valor) => { const nuevos = [...formData.localesFisicos]; nuevos[index][campo] = valor; setFormData({ ...formData, localesFisicos: nuevos }); };
  const handleMapCoords = (index, lat, lng) => { const nuevos = [...formData.localesFisicos]; nuevos[index].lat = lat; nuevos[index].lng = lng; setFormData({ ...formData, localesFisicos: nuevos }); };

  const buscarDireccionEnMapa = async (index) => {
    const local = formData.localesFisicos[index];
    if (!local.direccion || !local.numero || !local.comuna) return alert("Ingresa calle, número y comuna.");
    setBuscandoMapa(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${local.direccion} ${local.numero}, ${local.comuna}, RM, Chile`)}`);
      const data = await res.json();
      if (data.length > 0) handleMapCoords(index, parseFloat(data[0].lat), parseFloat(data[0].lon));
      else {
        const resCalle = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${local.direccion}, ${local.comuna}, Chile`)}`);
        const dataCalle = await resCalle.json();
        if (dataCalle.length > 0) handleMapCoords(index, parseFloat(dataCalle[0].lat), parseFloat(dataCalle[0].lon));
      }
    } catch (error) { 
      console.error(error); // Corrección ESLint
      alert("Hubo un problema de conexión con el mapa."); 
    } finally { 
      setBuscandoMapa(false); 
    }
  };

  const handleSubmitPerfil = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const dataToSend = new FormData();
    dataToSend.append('tituloTienda', formData.tituloTienda);
    dataToSend.append('biografia', formData.biografia);
    dataToSend.append('tarifaReferencia', formData.tarifaReferencia);
    dataToSend.append('tipoAtencion', formData.tipoAtencion);
    dataToSend.append('zonaCobertura', JSON.stringify(formData.zonaCobertura));
    dataToSend.append('localesFisicos', JSON.stringify(formData.localesFisicos));

    try {
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/auth/perfil', { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: dataToSend });
      const data = await response.json();
      if (response.ok && data.success) {
        setPrestador(data.usuario);
        setEditando(false);
        setMensaje({ texto: 'Ficha comercial actualizada.', tipo: 'success' });
      } else { setMensaje({ texto: data.message || 'Error al actualizar.', tipo: 'error' }); }
    } catch (error) { 
      console.error(error); // Corrección ESLint
      setMensaje({ texto: 'Error de conexión.', tipo: 'error' }); 
    }
  };

  const abrirModalCotizacion = (solicitud) => { setModalCotizacion(solicitud); setFormCotizacion({ manoDeObra: '', materiales: '', mensajePrestador: '' }); };

  const handleCotizar = async (e) => {
    e.preventDefault();
    setProcesando(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/marketplace/solicitudes/${modalCotizacion._id}/cotizar`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ manoDeObra: Number(formCotizacion.manoDeObra), materiales: Number(formCotizacion.materiales), mensajePrestador: formCotizacion.mensajePrestador })
      });
      const data = await response.json();
      if (response.ok && data.success) { setModalCotizacion(null); cargarDatos(); } else { alert(data.message); }
    } catch (error) { 
      console.error("Error al cotizar:", error); // Corrección ESLint
    } finally { 
      setProcesando(false); 
    }
  };

  const cambiarEstadoSolicitud = async (id, nuevoEstado) => {
    if (!window.confirm(`¿Estás seguro de marcar esta solicitud como ${nuevoEstado}?`)) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/marketplace/solicitudes/${id}/estado`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ estado: nuevoEstado })
      });
      if (response.ok) cargarDatos();
    } catch (error) { 
      console.error("Error estado solicitud:", error); // Corrección ESLint
    }
  };

  const solicitudesPendientes = solicitudes.filter(s => s.estado === 'Pendiente').length;
  const trabajosActivos = solicitudes.filter(s => s.estado === 'Aceptado').length;
  const resenasRecibidas = solicitudes.filter(s => s.calificacion && s.calificacion.estrellas).sort((a, b) => new Date(b.calificacion.fecha) - new Date(a.calificacion.fecha));
  
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
    if (!fechaISO) return '';
    return new Date(fechaISO).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
  };

  const solicitudesMostradas = filtroEstadoSolicitud 
    ? solicitudes.filter(s => s.estado === filtroEstadoSolicitud)
    : solicitudes;

  if (cargando) return <div className="p-8 text-center font-semibold">Cargando ficha...</div>;

  return (
    <div className="min-h-screen bg-[#f5f1ea] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* MÓDULO SUPERIOR: FICHA Y MÉTRICAS */}
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-3xl font-extrabold text-[#1b3b2c]">Ficha Pública</h1>
            
            {prestador?.isVerified ? (
              <span className="bg-gray-100 text-[#1b3b2c] font-extrabold px-5 py-2.5 rounded-full text-sm border border-gray-300 shadow-sm flex items-center gap-2">
                Perfil Verificado <InsigniaVerificada className="w-5 h-5" />
              </span>
            ) : (
              <span className="bg-yellow-100 text-yellow-800 font-extrabold px-5 py-2.5 rounded-full text-sm border border-yellow-300 shadow-sm">⏳ Pendiente de Auditoría</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6 border-b border-gray-200 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              
              {editando ? (
                <FotoPerfilEditor 
                  perfil={prestador} 
                  onActualizar={cargarDatos} 
                  tema="claro" 
                  tamaño="mediano" 
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 border-4 border-[#1b3b2c] overflow-hidden flex-shrink-0 relative shadow-inner">
                  {prestador?.fotoPerfil ? (
                    <img src={prestador.fotoPerfil.startsWith('http') ? prestador.fotoPerfil : `http://localhost:5000/${prestador.fotoPerfil}`} alt="Perfil" className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center font-extrabold text-3xl text-[#1b3b2c]">{prestador?.nombre?.charAt(0)}</div>}
                </div>
              )}
              
              <div className="text-center sm:text-left mt-1">
                <h2 className="text-2xl font-extrabold text-[#1b3b2c] mb-1">{prestador?.tituloTienda || prestador?.nombre || 'Mi Tienda'}</h2>
                <p className="text-sm text-gray-700 font-bold mb-2">{prestador?.oficio}</p>
                <p className="text-lg font-extrabold text-[#1b3b2c]">⭐ {prestador?.calificacionPromedio || '0.0'}</p>
              </div>
            </div>
            <button onClick={() => setEditando(!editando)} className="w-full sm:w-auto bg-[#1b3b2c] text-white px-6 py-2.5 rounded-md text-sm font-bold hover:bg-opacity-90 shadow-sm">
              {editando ? 'Cerrar Edición' : 'Editar Ficha y Foto'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#f5f1ea] p-4 rounded-md border border-gray-300 flex flex-col justify-center">
              <h3 className="text-xs font-bold text-gray-600 uppercase">Visibilidad</h3>
              <p className="text-xl font-extrabold text-[#1b3b2c] mt-1">{prestador?.isVerified ? 'Público' : 'Oculto'}</p>
            </div>
            <div className="bg-[#f5f1ea] p-4 rounded-md border border-gray-300 flex flex-col justify-center">
              <h3 className="text-xs font-bold text-gray-600 uppercase">Reseñas</h3>
              <button onClick={() => setMostrarModalResenas(true)} className="text-xl font-extrabold text-[#1b3b2c] mt-1 text-left hover:text-blue-600 outline-none">
                Ver ({prestador?.numeroResenas || 0}) ↗
              </button>
            </div>
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 flex flex-col justify-center">
              <h3 className="text-xs font-bold text-yellow-800 uppercase">Nuevas</h3>
              <p className="text-2xl font-extrabold text-yellow-900 mt-1">{solicitudesPendientes}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-md border border-green-200 flex flex-col justify-center">
              <h3 className="text-xs font-bold text-green-800 uppercase">Activas</h3>
              <p className="text-2xl font-extrabold text-green-900 mt-1">{trabajosActivos}</p>
            </div>
          </div>

          {mensaje.texto && (
            <div className={`p-4 mb-6 rounded-md text-sm font-bold ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{mensaje.texto}</div>
          )}

          {editando ? (
            <form onSubmit={handleSubmitPerfil} className="space-y-6 bg-gray-50 p-6 rounded-md border border-gray-200 mt-4">
              <div className="grid grid-cols-1 gap-6">
                <div><label className="block text-sm font-bold mb-2">Título de la Tienda</label><input type="text" name="tituloTienda" value={formData.tituloTienda} onChange={handleChange} className="w-full border px-4 py-2.5 rounded outline-none" /></div>
              </div>

              <div><label className="block text-sm font-bold mb-2">Biografía</label><textarea name="biografia" rows="3" value={formData.biografia} onChange={handleChange} className="w-full border px-4 py-3 rounded outline-none"></textarea></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
                <div><label className="block text-sm font-bold mb-2">Tarifa Referencia</label><input type="text" name="tarifaReferencia" value={formData.tarifaReferencia} onChange={handleChange} className="w-full border px-4 py-2.5 rounded outline-none" /></div>
                <div>
                  <label className="block text-sm font-bold mb-2">Modalidad de Atención</label>
                  <select name="tipoAtencion" value={formData.tipoAtencion} onChange={handleChange} className="w-full border px-4 py-2.5 rounded outline-none">
                    <option value="A domicilio">Solo a Domicilio</option>
                    <option value="En local">Solo en Local Físico</option>
                    <option value="Ambas">Ambas Modalidades</option>
                  </select>
                </div>
              </div>

              {(formData.tipoAtencion === 'A domicilio' || formData.tipoAtencion === 'Ambas') && (
                <div className="bg-[#f5f1ea] p-4 rounded border">
                  <h4 className="font-extrabold mb-3">Zonas de Cobertura (A Domicilio)</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.zonaCobertura.map(comuna => (
                      <span key={comuna} className="bg-[#1b3b2c] text-white text-xs px-3 py-1.5 rounded-full">{comuna} <button type="button" onClick={() => handleRemoverComuna(comuna)}>✕</button></span>
                    ))}
                  </div>
                  <select onChange={handleAgregarComuna} defaultValue="" className="w-full border px-4 py-2.5 rounded text-sm outline-none">
                    <option value="" disabled>Seleccionar comuna de cobertura...</option>
                    {COMUNAS_RM.filter(c => !formData.zonaCobertura.includes(c)).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {(formData.tipoAtencion === 'En local' || formData.tipoAtencion === 'Ambas') && (
                <div className="bg-white p-4 rounded border border-gray-300">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-extrabold">Tus Locales Físicos</h4>
                    <button type="button" onClick={agregarLocal} className="text-xs font-bold bg-[#e8c582] text-[#1b3b2c] px-3 py-1.5 rounded">+ Añadir Local</button>
                  </div>
                  
                  <div className="space-y-6">
                    {formData.localesFisicos.map((local, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded border border-gray-200">
                        <div className="flex justify-between mb-3">
                          <h5 className="font-bold text-sm text-gray-700">Local {index + 1}</h5>
                          <button type="button" onClick={() => removerLocal(index)} className="text-red-500 font-bold text-xs">Eliminar Local</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
                          <div className="md:col-span-3">
                            <input type="text" placeholder="Nombre (Ej: Matriz)" value={local.nombreLocal} onChange={(e) => handleLocalChange(index, 'nombreLocal', e.target.value)} className="w-full border px-3 py-2.5 rounded text-sm outline-none" />
                          </div>
                          <div className="md:col-span-3">
                            <select required value={local.comuna} onChange={(e) => handleLocalChange(index, 'comuna', e.target.value)} className="w-full border px-3 py-2.5 rounded text-sm outline-none bg-white">
                              <option value="" disabled>Comuna</option>
                              {COMUNAS_RM.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div className="md:col-span-4">
                            <input type="text" placeholder="Calle (Ej: Los Leones)" required value={local.direccion} onChange={(e) => handleLocalChange(index, 'direccion', e.target.value)} className="w-full border px-3 py-2.5 rounded text-sm outline-none" />
                          </div>
                          <div className="md:col-span-2">
                            <input type="text" placeholder="N°" required value={local.numero} onChange={(e) => handleLocalChange(index, 'numero', e.target.value)} className="w-full border px-3 py-2.5 rounded text-sm outline-none" />
                          </div>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                          <p className="text-xs text-gray-500">Haz clic en "Ubicar" para mover el pin a la calle escrita.</p>
                          <button 
                            type="button" 
                            onClick={() => buscarDireccionEnMapa(index)} 
                            disabled={buscandoMapa}
                            className="bg-[#1b3b2c] text-white px-4 py-2 rounded text-xs font-bold hover:bg-opacity-90 disabled:bg-gray-400 shadow-sm"
                          >
                            📍 {buscandoMapa ? 'Buscando...' : 'Ubicar en Mapa'}
                          </button>
                        </div>
                        
                        <div className="h-64 w-full rounded border border-gray-300 overflow-hidden relative z-0">
                          <div className="absolute top-2 left-2 z-[1000] bg-white px-3 py-1 text-xs font-bold rounded shadow border">
                            📍 Arrastra el pin o haz clic en el mapa para ubicar tu local con precisión exacta
                          </div>
                          <MapContainer center={[local.lat, local.lng]} zoom={15} style={{ width: '100%', height: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                            <MapUpdater center={[local.lat, local.lng]} />
                            <MapPicker setCoords={(lat, lng) => handleMapCoords(index, lat, lng)} />
                            <Marker 
                              draggable={true}
                              eventHandlers={{
                                dragend: (e) => {
                                  const marker = e.target;
                                  const position = marker.getLatLng();
                                  handleMapCoords(index, position.lat, position.lng);
                                }
                              }}
                              position={[local.lat, local.lng]} 
                            />
                          </MapContainer>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-right">Coord: {local.lat.toFixed(5)}, {local.lng.toFixed(5)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <button type="submit" className="w-full md:w-auto px-8 bg-[#1b3b2c] text-white py-3 rounded font-bold text-sm shadow-md hover:bg-opacity-90 transition-all">Guardar Detalles</button>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md border w-full text-left mt-2">
              <span className="font-bold text-gray-400 block text-xs uppercase mb-1">Modalidad: <span className="text-[#1b3b2c]">{prestador?.tipoAtencion}</span></span>
              {(prestador?.tipoAtencion === 'A domicilio' || prestador?.tipoAtencion === 'Ambas') && (
                <div className="mt-3"><span className="font-bold text-gray-400 text-xs uppercase">Cobertura a Domicilio:</span> <span className="font-extrabold text-sm">{prestador?.zonaCobertura?.join(', ') || 'N/A'}</span></div>
              )}
              {(prestador?.tipoAtencion === 'En local' || prestador?.tipoAtencion === 'Ambas') && prestador?.localesFisicos?.length > 0 && (
                <div className="mt-4 pt-4 border-t"><span className="font-bold text-gray-400 block text-xs uppercase mb-2">Locales Registrados:</span>
                  <div className="space-y-2">{prestador.localesFisicos.map((local, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded border text-sm"><span className="font-extrabold mr-2">{local.nombreLocal || 'Local'}:</span> {local.direccion} {local.numero}, {local.comuna}</div>
                  ))}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BANDEJA SOLICITUDES */}
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold">Bandeja de Solicitudes</h2>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <select 
                value={filtroEstadoSolicitud} 
                onChange={(e) => setFiltroEstadoSolicitud(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm font-bold outline-none focus:border-[#1b3b2c]"
              >
                <option value="">Todos los Estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Cotizado">Cotizado</option>
                <option value="Aceptado">Aceptado</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Rechazado">Rechazado</option>
              </select>

              <div className="flex bg-gray-100 p-1.5 rounded">
                <button onClick={() => setVistaSolicitudes('mosaico2')} className={`px-4 py-1.5 rounded text-sm font-bold ${vistaSolicitudes==='mosaico2'?'bg-white shadow':''}`}>Grilla</button>
                <button onClick={() => setVistaSolicitudes('lista')} className={`px-4 py-1.5 rounded text-sm font-bold ${vistaSolicitudes==='lista'?'bg-white shadow':''}`}>Lista</button>
              </div>
            </div>
          </div>
          
          {solicitudesMostradas.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded"><p className="text-gray-600 font-bold">No hay solicitudes que coincidan con la búsqueda.</p></div>
          ) : (
            <div className={vistaSolicitudes === 'lista' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}>
              {solicitudesMostradas.map(sol => (
                <div key={sol._id} className="border rounded-lg p-5 bg-gray-50 flex flex-col h-full">
                  <div className="flex justify-between mb-4">
                    <div><h4 className="font-extrabold">{sol.cliente?.nombre}</h4><p className="text-xs text-gray-500">{formatearFecha(sol.createdAt)}</p></div>
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${getBadgeColor(sol.estado)}`}>{sol.estado}</span>
                  </div>
                  <div className="bg-white p-3.5 rounded border mb-4 flex-grow"><p className="text-sm">{sol.descripcionCliente}</p></div>
                  <div className="flex gap-2 justify-end mt-auto pt-3 border-t">
                    {sol.estado === 'Pendiente' && (<><button onClick={() => cambiarEstadoSolicitud(sol._id, 'Rechazado')} className="px-4 py-2 rounded text-xs font-bold text-red-600 bg-red-50 border border-red-200">Rechazar</button><button onClick={() => abrirModalCotizacion(sol)} className="px-4 py-2 rounded text-xs font-bold text-white bg-[#1b3b2c]">Cotizar</button></>)}
                    {sol.estado === 'Aceptado' && <button onClick={() => cambiarEstadoSolicitud(sol._id, 'Finalizado')} className="w-full px-4 py-2.5 rounded text-sm font-bold text-white bg-green-600 border border-green-700">✓ Marcar como Finalizado</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL COTIZACION */}
      {modalCotizacion && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg max-w-lg w-full relative">
            <button onClick={() => setModalCotizacion(null)} className="absolute top-4 right-4 text-3xl font-bold">&times;</button>
            <h3 className="text-2xl font-extrabold mb-6">Presupuesto Digital</h3>
            <form onSubmit={handleCotizar} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold mb-2">Mano de Obra ($)</label><input type="number" value={formCotizacion.manoDeObra} onChange={e=>setFormCotizacion({...formCotizacion, manoDeObra: e.target.value})} className="w-full border px-4 py-2 rounded outline-none" required /></div>
                <div><label className="block text-xs font-bold mb-2">Materiales ($)</label><input type="number" value={formCotizacion.materiales} onChange={e=>setFormCotizacion({...formCotizacion, materiales: e.target.value})} className="w-full border px-4 py-2 rounded outline-none" required /></div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={procesando} className="px-6 py-2.5 rounded font-bold text-white bg-[#1b3b2c]">
                  {procesando ? 'Enviando...' : 'Enviar Cotización'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- INTEGRACIÓN DEL NUEVO COMPONENTE DE RESEÑAS --- */}
      {mostrarModalResenas && (
        <ResenaView 
          resenas={resenasRecibidas} 
          onClose={() => setMostrarModalResenas(false)} 
        />
      )}
    </div>
  );
};

export default PrestadorDashboard;