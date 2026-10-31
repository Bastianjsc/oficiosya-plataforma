import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificacionesView = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // 1. Envolvemos la función en useCallback
  const cargarNotificaciones = useCallback(async () => {
    if (!token) return navigate('/login');
    try {
      const res = await fetch('${import.meta.env.VITE_API_URL}/api/auth/notificaciones', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const data = await res.json();
      if (data.success) setNotificaciones(data.notificaciones);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setCargando(false); 
    }
  }, [token, navigate]);

// 2. Ejecutamos la función a través de un intermediario asíncrono
  useEffect(() => { 
    const inicializar = async () => {
      await cargarNotificaciones();
    };
    inicializar();
  }, [cargarNotificaciones]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSeleccionadas(notificaciones.map(n => n._id));
    } else {
      setSeleccionadas([]);
    }
  };

  const handleSelectOne = (id) => {
    if (seleccionadas.includes(id)) {
      setSeleccionadas(seleccionadas.filter(item => item !== id));
    } else {
      setSeleccionadas([...seleccionadas, id]);
    }
  };

  const eliminarIndividual = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/notificaciones/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      cargarNotificaciones();
      setSeleccionadas(seleccionadas.filter(item => item !== id));
    } catch (e) { console.error(e); }
  };

  const eliminarMasa = async () => {
    if (seleccionadas.length === 0) return;
    if (!window.confirm(`¿Estás seguro de eliminar ${seleccionadas.length} notificaciones permanentemente?`)) return;

    try {
      await fetch('${import.meta.env.VITE_API_URL}/api/auth/notificaciones/masa', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ids: seleccionadas })
      });
      setSeleccionadas([]);
      cargarNotificaciones();
    } catch (e) { console.error(e); }
  };

  const formatearFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });

  if (cargando) return <div className="p-8 text-center text-gray-600 font-bold">Cargando historial de notificaciones...</div>;

  return (
    <div className="min-h-screen bg-[#f5f1ea] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-3xl font-extrabold text-[#1b3b2c]">Gestor de Notificaciones</h2>
            <button 
              onClick={eliminarMasa} 
              disabled={seleccionadas.length === 0}
              className={`px-4 py-2 mt-4 md:mt-0 rounded-md font-bold text-sm transition-all ${seleccionadas.length > 0 ? 'bg-red-600 text-white shadow-md hover:bg-red-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              🗑️ Borrar Seleccionadas ({seleccionadas.length})
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-md overflow-hidden">
            {notificaciones.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <span className="text-5xl block mb-4">📭</span>
                <p className="text-lg font-bold">No tienes notificaciones en tu historial.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-200 border-b border-gray-300 text-xs text-gray-700 font-extrabold">
                    <th className="p-4 w-12 text-center">
                      <input type="checkbox" onChange={handleSelectAll} checked={seleccionadas.length === notificaciones.length && notificaciones.length > 0} className="w-4 h-4 cursor-pointer accent-[#1b3b2c]" />
                    </th>
                    <th className="p-4">Mensaje</th>
                    <th className="p-4 w-32">Fecha</th>
                    <th className="p-4 w-16 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {notificaciones.map(n => (
                    <tr key={n._id} className={`border-b border-gray-200 hover:bg-white transition-colors ${n.leida ? 'text-gray-500' : 'text-[#1b3b2c] font-bold bg-white'}`}>
                      <td className="p-4 text-center">
                        <input type="checkbox" onChange={() => handleSelectOne(n._id)} checked={seleccionadas.includes(n._id)} className="w-4 h-4 cursor-pointer accent-[#1b3b2c]"/>
                      </td>
                      <td className="p-4 text-sm">{n.texto} {n.leida ? '' : <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>}</td>
                      <td className="p-4 text-xs font-semibold">{formatearFecha(n.fecha)}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => eliminarIndividual(n._id)} className="text-red-400 hover:text-red-700 transition-colors text-lg" title="Borrar para siempre">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificacionesView;