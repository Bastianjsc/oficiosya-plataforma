import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { marcadorRojo } from '../components/MapHelpers';
import InsigniaVerificada from '../components/InsigniaVerificada';
import ResenaView from '../components/ResenaView'; // Componente modular

const PrestadorPublicoView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prestador, setPrestador] = useState(null);
  
  // Estado para almacenar las reseñas procesadas
  const [resenasRecibidas, setResenasRecibidas] = useState([]);
  const [mostrarModalResenas, setMostrarModalResenas] = useState(false);
  
  const [descripcionProblema, setDescripcionProblema] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    // Para asegurarnos de traer las reseñas, vamos a consultar el perfil del prestador
    // Si tu backend no adjunta las reseñas en esta llamada, avísame para agregar una llamada adicional a /solicitudes
    fetch(`${import.meta.env.VITE_API_URL}/api/auth/prestadores-publicos/${id}`)
      .then(res => res.json())
      .then(data => { 
        if(data.success) {
          setPrestador(data.prestador);
          
          // Lógica robusta para extraer reseñas
          // Primero, intentamos ver si el backend las envió directamente en 'resenas'
          if (data.prestador.resenas && Array.isArray(data.prestador.resenas) && data.prestador.resenas.length > 0) {
            const resenasOrdenadas = [...data.prestador.resenas].sort(
              (a, b) => new Date(b.calificacion?.fecha || 0) - new Date(a.calificacion?.fecha || 0)
            );
            setResenasRecibidas(resenasOrdenadas);
          } 
          // Segundo, si el backend las envió como un array de 'solicitudes' populadas
          else if (data.prestador.solicitudes && Array.isArray(data.prestador.solicitudes)) {
            const solicitudesConResena = data.prestador.solicitudes.filter(s => s.calificacion && s.calificacion.estrellas);
            const resenasOrdenadas = solicitudesConResena.sort(
              (a, b) => new Date(b.calificacion?.fecha || 0) - new Date(a.calificacion?.fecha || 0)
            );
            setResenasRecibidas(resenasOrdenadas);
          } else {
             // Si el arreglo viene vacío, nos aseguramos de setear un array vacío para que React no falle
             setResenasRecibidas([]);
          }
        } 
      })
      .catch(console.error);
  }, [id]);

  const handleSolicitarServicio = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert("Debes iniciar sesión como cliente para enviar una solicitud.");
      return navigate('/login');
    }

    setEnviando(true);
    try {
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/marketplace/solicitudes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prestadorId: id, descripcionCliente: descripcionProblema })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMensaje({ texto: '¡Solicitud enviada! El prestador te enviará un presupuesto pronto.', tipo: 'success' });
        setDescripcionProblema('');
      } else {
        setMensaje({ texto: data.message || 'Error al enviar la solicitud.', tipo: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' });
    } finally {
      setEnviando(false);
    }
  };

  if (!prestador) return <div className="min-h-screen flex justify-center items-center bg-[#f5f1ea]"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1b3b2c]"></div></div>;

  const estaVerificado = prestador.isVerified || true; 

  return (
    <div className="min-h-screen bg-[#f5f1ea] py-12 px-4 relative">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Info del Prestador */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tarjeta Principal */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 border-4 border-[#e8c582] overflow-hidden flex-shrink-0 relative shadow-inner">
                {prestador.fotoPerfil ? (
                  <img src={prestador.fotoPerfil.startsWith('http') ? prestador.fotoPerfil : `${import.meta.env.VITE_API_URL}/${prestador.fotoPerfil}`} alt="Perfil" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-extrabold text-4xl text-gray-500">{prestador.nombre.charAt(0)}</div>
                )}
              </div>
              
              <div className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1b3b2c] leading-tight flex items-center gap-2">
                    {prestador.tituloTienda || prestador.nombre}
                    {estaVerificado && <InsigniaVerificada className="w-6 h-6 sm:w-8 sm:h-8" />}
                  </h1>
                </div>
                
                <p className="text-lg text-gray-600 font-bold mb-5">{prestador.oficio}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-[#f5f1ea] px-4 py-2 rounded-md border border-gray-300">
                    <span className="text-xl">💰</span>
                    <div className="flex flex-col leading-tight">
                      <span className="text-[10px] uppercase font-bold text-gray-500">Tarifa Referencia</span>
                      <span className="font-extrabold text-[#1b3b2c]">{prestador.tarifaReferencia}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#f5f1ea] px-4 py-2 rounded-md border border-gray-300">
                    <span className="text-xl">📍</span>
                    <div className="flex flex-col leading-tight">
                      <span className="text-[10px] uppercase font-bold text-gray-500">Modalidad Atención</span>
                      <span className="font-extrabold text-[#1b3b2c]">{prestador.tipoAtencion}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-extrabold text-[#1b3b2c] mb-4">Sobre este profesional</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{prestador.biografia || 'Sin descripción disponible.'}</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="block text-4xl font-extrabold text-[#1b3b2c]">{prestador.calificacionPromedio || '0.0'}</span>
                <div className="text-[#e8c582] text-xl mt-1">⭐⭐⭐⭐⭐</div>
              </div>
              <div className="w-px h-16 bg-gray-200 hidden sm:block"></div>
              <div>
                <h3 className="text-lg font-extrabold text-[#1b3b2c]">Calificación de Clientes</h3>
                <p className="text-sm font-medium text-gray-600">Basado en {prestador.numeroResenas || 0} reseñas de trabajos reales completados a través de la plataforma.</p>
              </div>
            </div>
            <button 
              onClick={() => setMostrarModalResenas(true)}
              className="w-full sm:w-auto bg-[#1b3b2c] text-white font-bold px-6 py-3 rounded-md hover:bg-opacity-90 transition-colors shadow-sm whitespace-nowrap"
            >
              Leer Reseñas →
            </button>
          </div>

          {(prestador.tipoAtencion === 'A domicilio' || prestador.tipoAtencion === 'Ambas') && prestador.zonaCobertura?.length > 0 && (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-extrabold text-[#1b3b2c] mb-4 flex items-center gap-2">🏠 Zonas de Cobertura a Domicilio</h2>
              <div className="flex flex-wrap gap-2">
                {prestador.zonaCobertura.map(comuna => (
                  <span key={comuna} className="bg-[#f5f1ea] text-[#1b3b2c] border border-gray-300 px-4 py-2 rounded-full text-sm font-bold shadow-sm">{comuna}</span>
                ))}
              </div>
            </div>
          )}

          {(prestador.tipoAtencion === 'En local' || prestador.tipoAtencion === 'Ambas') && prestador.localesFisicos?.length > 0 && (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-extrabold text-[#1b3b2c] mb-4 flex items-center gap-2">📍 Visitar Sucursal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {prestador.localesFisicos.map((local, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded border border-gray-200">
                    <h3 className="font-extrabold text-[#1b3b2c] mb-1">{local.nombreLocal || 'Casa Matriz'}</h3>
                    <p className="text-sm text-gray-600 font-medium">{local.direccion} {local.numero}</p>
                    <p className="text-sm text-gray-600 font-bold">{local.comuna}</p>
                  </div>
                ))}
              </div>
              <div className="h-64 w-full rounded border border-gray-300 overflow-hidden relative z-0">
                <MapContainer center={[prestador.localesFisicos[0].ubicacion.coordinates[1], prestador.localesFisicos[0].ubicacion.coordinates[0]]} zoom={13} style={{ width: '100%', height: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                  {prestador.localesFisicos.map((local, idx) => (
                    <Marker key={idx} position={[local.ubicacion.coordinates[1], local.ubicacion.coordinates[0]]} icon={marcadorRojo}>
                      <Popup>
                        <strong className="text-[#1b3b2c]">{local.nombreLocal || 'Sucursal'}</strong><br/>
                        {local.direccion} {local.numero}, {local.comuna}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Formulario de Contacto */}
        <div className="lg:col-span-1 relative">
          <div className="bg-white p-6 rounded-lg shadow-md border border-[#e8c582] sticky top-6">
            <h2 className="text-xl font-extrabold text-[#1b3b2c] mb-2">Solicitar Presupuesto</h2>
            <p className="text-sm text-gray-600 mb-6">Describe tu problema detalladamente. El profesional revisará tu solicitud y te enviará una cotización sin costo.</p>
            
            <Alert mensaje={mensaje} tipo={mensaje.tipo} />

            <form onSubmit={handleSolicitarServicio} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Detalles del problema o proyecto <span className="text-red-500">*</span></label>
                <textarea 
                  required 
                  rows="5" 
                  value={descripcionProblema}
                  onChange={(e) => setDescripcionProblema(e.target.value)}
                  placeholder="Ej: Necesito cambiar dos enchufes en la cocina y revisar el cableado del comedor. La casa está ubicada en un segundo piso..."
                  className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-3 rounded-md outline-none focus:border-[#1b3b2c] resize-none text-sm"
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={enviando}
                className={`w-full font-extrabold text-white py-4 rounded-md shadow-md transition-all ${enviando ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1b3b2c] hover:bg-opacity-90 text-[#e8c582]'}`}
              >
                {enviando ? 'Enviando solicitud...' : 'Enviar Solicitud al Profesional'}
              </button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500 font-bold mb-2">🔒 Transacción Segura</p>
              <p className="text-[10px] text-gray-400">No pagues por adelantado fuera de la plataforma hasta acordar los términos finales del presupuesto.</p>
            </div>
          </div>
        </div>

      </div>

      {/* --- INTEGRACIÓN DEL COMPONENTE DE RESEÑAS --- */}
      {mostrarModalResenas && (
        <ResenaView 
          resenas={resenasRecibidas} 
          onClose={() => setMostrarModalResenas(false)} 
        />
      )}

    </div>
  );
};

export default PrestadorPublicoView;