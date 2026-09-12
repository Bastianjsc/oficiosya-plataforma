import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PrestadorDashboard = () => {
  const [prestador, setPrestador] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  
  const [formData, setFormData] = useState({
    tituloTienda: '',
    biografia: '',
    tarifaReferencia: '',
    zonaCobertura: ''
  });
  const [fotoArchivo, setFotoArchivo] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const navigate = useNavigate();

  const cargarPerfil = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:5000/api/auth/perfil', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPrestador(data.usuario);
          setFormData({
            tituloTienda: data.usuario.tituloTienda || '',
            biografia: data.usuario.biografia || '',
            tarifaReferencia: data.usuario.tarifaReferencia || '',
            zonaCobertura: data.usuario.zonaCobertura || ''
          });
        }
      })
      .catch(err => console.error('Error cargando perfil', err))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarPerfil();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFotoArchivo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    // Usamos FormData para enviar archivos e información en texto plano conjuntamente
    const dataToSend = new FormData();
    dataToSend.append('tituloTienda', formData.tituloTienda);
    dataToSend.append('biografia', formData.biografia);
    dataToSend.append('tarifaReferencia', formData.tarifaReferencia);
    dataToSend.append('zonaCobertura', formData.zonaCobertura);
    if (fotoArchivo) {
      dataToSend.append('fotoPerfil', fotoArchivo);
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/perfil', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: dataToSend
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setPrestador(data.usuario);
        setEditando(false);
        setFotoArchivo(null);
        setMensaje({ texto: 'Ficha comercial actualizada con éxito.', tipo: 'success' });
      } else {
        setMensaje({ texto: data.message || 'Error al actualizar.', tipo: 'error' });
      }
    } catch (error) {
      setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' });
    }
  };

  if (cargando) {
    return <div className="p-8 text-center text-gray-600 font-semibold">Cargando panel de control...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f5f1ea] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Panel de Métricas y Estado (RF-07) */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-2xl font-extrabold text-[#1b3b2c]">Dashboard del Prestador</h1>
            
            {prestador?.isVerified ? (
              <span className="bg-green-100 text-green-800 font-extrabold px-4 py-2 rounded-full text-sm border border-green-300">
                ✓ Sello de Confianza Activo[cite: 1]
              </span>
            ) : (
              <span className="bg-yellow-100 text-yellow-800 font-extrabold px-4 py-2 rounded-full text-sm border border-yellow-300">
                ⏳ Pendiente de Auditoría[cite: 1]
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#f5f1ea] p-4 rounded-md border border-gray-300">
              <h3 className="text-xs font-bold text-gray-600">Visibilidad Comercial</h3>
              <p className="text-md font-extrabold text-[#1b3b2c] mt-1">
                {prestador?.isVerified ? 'Público en Búsquedas' : 'Oculto por Seguridad'}[cite: 1]
              </p>
            </div>
            <div className="bg-[#f5f1ea] p-4 rounded-md border border-gray-300">
              <h3 className="text-xs font-bold text-gray-600">Calificación Promedio</h3>
              <p className="text-md font-extrabold text-[#1b3b2c] mt-1">
                ⭐ {prestador?.calificacionPromedio || '0.0'} ({prestador?.numeroResenas || 0} reseñas)[cite: 1]
              </p>
            </div>
            <div className="bg-[#f5f1ea] p-4 rounded-md border border-gray-300">
              <h3 className="text-xs font-bold text-gray-600">Solicitudes Activas</h3>
              <p className="text-md font-extrabold text-[#1b3b2c] mt-1">0 pendientes</p>
            </div>
          </div>
        </div>

        {/* Sección de Configuración y Vista Previa */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#1b3b2c]">Gestión de tu Ficha Pública</h2>
            <button 
              onClick={() => setEditando(!editando)}
              className="bg-[#1b3b2c] text-white px-4 py-2 rounded-md text-xs font-bold hover:bg-opacity-90 transition-all"
            >
              {editando ? 'Cancelar Edición' : 'Editar Ficha'}
            </button>
          </div>

          {mensaje.texto && (
            <div className={`p-3 mb-4 rounded-md text-sm font-medium ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {mensaje.texto}
            </div>
          )}

          {editando ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Título de la Tienda / Negocio</label>
                <input 
                  type="text" 
                  name="tituloTienda" 
                  value={formData.tituloTienda} 
                  onChange={handleChange}
                  placeholder="Ej: Servicios Eléctricos ProExpress"
                  className="w-full bg-[#f5f1ea] border border-gray-300 px-3 py-2 rounded-md text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Subir Fotografía de Perfil (Archivo)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full bg-[#f5f1ea] border border-gray-300 px-3 py-2 rounded-md text-sm outline-none file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#1b3b2c] file:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Biografía / Descripción Profesional</label>
                <textarea 
                  name="biografia" 
                  rows="3"
                  value={formData.biografia} 
                  onChange={handleChange}
                  placeholder="Describe tu experiencia y especialidades..."
                  className="w-full bg-[#f5f1ea] border border-gray-300 px-3 py-2 rounded-md text-sm outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tarifa de Referencia</label>
                  <input 
                    type="text" 
                    name="tarifaReferencia" 
                    value={formData.tarifaReferencia} 
                    onChange={handleChange}
                    placeholder="Ej: $25.000 visita técnica"
                    className="w-full bg-[#f5f1ea] border border-gray-300 px-3 py-2 rounded-md text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Zona de Cobertura</label>
                  <input 
                    type="text" 
                    name="zonaCobertura" 
                    value={formData.zonaCobertura} 
                    onChange={handleChange}
                    placeholder="Ej: Santiago Centro, Ñuñoa"
                    className="w-full bg-[#f5f1ea] border border-gray-300 px-3 py-2 rounded-md text-sm outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#1b3b2c] text-white py-2 rounded-md font-bold text-sm hover:bg-opacity-90 transition-all"
              >
                Guardar Cambios Comerciales
              </button>
            </form>
          ) : (
            /* Vista Previa Homogénea de la Ficha */
            <div className="border border-gray-200 rounded-lg p-6 bg-[#f5f1ea] space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center font-bold text-xl text-gray-700 flex-shrink-0">
                  {prestador?.fotoPerfil ? (
                    <img src={`http://localhost:5000/${prestador.fotoPerfil}`} alt={prestador.nombre} className="w-full h-full object-cover" />
                  ) : (
                    prestador?.nombre?.charAt(0)
                  )}
                </div>
                <div className="text-center sm:text-left">
                  {/* Título de la Tienda Principal */}
                  <h3 className="text-xl font-extrabold text-[#1b3b2c]">{prestador?.tituloTienda || 'Mi Tienda de Servicios'}</h3>
                  {/* Nombre de registro y profesión */}
                  <p className="text-xs text-gray-600 font-semibold mt-0.5">
                    Prestador: <span className="text-gray-800">{prestador?.nombre}</span> | Profesión: <span className="text-gray-800">{prestador?.oficio || 'Independiente'}</span>
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed">
                {prestador?.biografia || 'Aún no has añadido una biografía descriptiva. Haz clic en "Editar Ficha" para completarla.'}
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs bg-white p-3 rounded-md border border-gray-300">
                <div>
                  <span className="font-bold text-gray-500 block">Tarifa:</span>
                  <span className="font-extrabold text-[#1b3b2c]">{prestador?.tarifaReferencia || 'A convenir'}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500 block">Cobertura:</span>
                  <span className="font-extrabold text-[#1b3b2c]">{prestador?.zonaCobertura || 'No especificada'}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PrestadorDashboard;