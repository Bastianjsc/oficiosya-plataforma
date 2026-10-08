import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PrestadorPublicoView = () => {
  const { id } = useParams();
  const [prestador, setPrestador] = useState(null);
  const [cargando, setCargando] = useState(true);
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/auth/prestadores-publicos/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPrestador(data.prestador);
        } else {
          navigate('/');
        }
      })
      .catch(err => console.error('Error cargando ficha', err))
      .finally(() => setCargando(false));
  }, [id, navigate]);

  const handleAbrirModal = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setDescripcion('');
    setMensaje({ texto: '', tipo: '' });
  };

  const enviarSolicitud = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    setEnviando(true);
    setMensaje({ texto: 'Procesando tu solicitud...', tipo: 'info' });

    try {
      const response = await fetch('http://localhost:5000/api/marketplace/solicitudes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prestadorId: id,
          descripcionCliente: descripcion
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMensaje({ texto: '¡Solicitud enviada con éxito! El técnico te responderá con una cotización.', tipo: 'success' });
      } else {
        setMensaje({ texto: data.message || 'Hubo un error al enviar la solicitud.', tipo: 'error' });
      }
    } catch (error) {
      setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' });
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <div className="p-8 text-center font-bold text-gray-600">Cargando perfil del profesional...</div>;
  if (!prestador) return null;

  return (
    <div className="min-h-screen bg-[#f5f1ea] p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <button onClick={() => navigate(-1)} className="text-[#1b3b2c] font-bold hover:underline flex items-center gap-2 mb-4">
          ← Volver a resultados
        </button>

        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-[#1b3b2c] overflow-hidden flex-shrink-0 relative shadow-inner">
              {prestador.fotoPerfil ? (
                <img src={prestador.fotoPerfil.startsWith('http') ? prestador.fotoPerfil : `http://localhost:5000/${prestador.fotoPerfil}`} alt={prestador.nombre} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-extrabold text-[#1b3b2c]">{prestador.nombre.charAt(0)}</div>
              )}
            </div>
            
            <div className="text-center md:text-left flex-grow">
              <h1 className="text-3xl font-extrabold text-[#1b3b2c] mb-1">{prestador.tituloTienda || prestador.nombre}</h1>
              <p className="text-lg text-gray-700 font-bold mb-2">{prestador.oficio}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <span className="bg-green-100 text-green-800 text-xs font-extrabold px-3 py-1 rounded-full border border-green-300">
                  ✓ Sello de Confianza
                </span>
                <span className="text-sm text-gray-600 font-bold">
                  ⭐ {prestador.calificacionPromedio} ({prestador.numeroResenas} reseñas)
                </span>
              </div>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Acerca del Profesional</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {prestador.biografia || 'Profesional verificado en la plataforma OficiosYa.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Tarifa de Referencia</span>
              <span className="text-lg font-extrabold text-[#1b3b2c]">{prestador.tarifaReferencia || 'A convenir'}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Zonas de Cobertura</span>
              <span className="text-sm font-bold text-[#1b3b2c]">
                {prestador.zonaCobertura?.length > 0 ? prestador.zonaCobertura.join(', ') : 'No especificada'}
              </span>
            </div>
          </div>

          <button 
            onClick={handleAbrirModal}
            className="w-full bg-[#1b3b2c] hover:bg-opacity-90 text-white text-lg font-extrabold py-4 rounded-md transition-all shadow-md"
          >
            Contratar Servicio
          </button>
        </div>
      </div>

      {/* MODAL DE SOLICITUD */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center p-4 z-50 transition-all">
          <div className="bg-white p-8 rounded-lg max-w-lg w-full shadow-2xl relative">
            
            {/* Botón de Cierre "X" Persistente */}
            <button 
              onClick={cerrarModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-3xl font-bold leading-none outline-none"
              title="Cerrar ventana"
            >
              &times;
            </button>

            <h3 className="text-2xl font-extrabold text-[#1b3b2c] mb-2 pr-6">Detalles del Servicio</h3>
            <p className="text-sm text-gray-600 mb-6">Describe brevemente el problema o servicio que necesitas para que {prestador.nombre} pueda enviarte una cotización precisa.</p>

            {mensaje.texto && (
              <div className={`p-4 mb-6 rounded-md text-sm font-bold ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {mensaje.texto}
              </div>
            )}

            {!mensaje.texto.includes('éxito') ? (
              <form onSubmit={enviarSolicitud}>
                <textarea 
                  required
                  rows="4"
                  placeholder="Ej: Necesito reparar una fuga de agua en el lavaplatos de la cocina..."
                  className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-3 rounded-md outline-none focus:border-[#1b3b2c] mb-6 resize-none"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                ></textarea>

                <div className="flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={cerrarModal}
                    className="px-6 py-2.5 rounded-md font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-all"
                    disabled={enviando}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 rounded-md font-bold text-white bg-[#1b3b2c] hover:bg-opacity-90 transition-all shadow-md"
                    disabled={enviando}
                  >
                    {enviando ? 'Enviando...' : 'Enviar Solicitud'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-end mt-2">
                <button 
                  onClick={cerrarModal}
                  className="w-full md:w-auto px-6 py-2.5 rounded-md font-bold text-white bg-[#1b3b2c] hover:bg-opacity-90 transition-all shadow-md"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrestadorPublicoView;