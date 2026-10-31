import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { MapUpdater, ClickSearcher, marcadorRojo } from '../components/MapHelpers';
import { COMUNAS_RM } from '../data/comunas';
import InsigniaVerificada from '../components/InsigniaVerificada'; // <-- NUEVA IMPORTACIÓN

const COORDS_COMUNAS = {
    "Cerrillos": { lat: -33.4833, lng: -70.7167 }, "Cerro Navia": { lat: -33.4258, lng: -70.7356 },
    "Conchalí": { lat: -33.3833, lng: -70.6833 }, "El Bosque": { lat: -33.5667, lng: -70.6667 },
    "Estación Central": { lat: -33.4667, lng: -70.7 }, "Huechuraba": { lat: -33.3667, lng: -70.6333 },
    "Independencia": { lat: -33.4167, lng: -70.6667 }, "La Cisterna": { lat: -33.5333, lng: -70.6667 },
    "La Florida": { lat: -33.5167, lng: -70.5167 }, "La Granja": { lat: -33.5333, lng: -70.6167 },
    "La Pintana": { lat: -33.5833, lng: -70.6333 }, "La Reina": { lat: -33.45, lng: -70.5333 },
    "Las Condes": { lat: -33.4167, lng: -70.5833 }, "Lo Barnechea": { lat: -33.35, lng: -70.5167 },
    "Lo Espejo": { lat: -33.5167, lng: -70.6833 }, "Lo Prado": { lat: -33.4333, lng: -70.7167 },
    "Macul": { lat: -33.4833, lng: -70.6 }, "Maipú": { lat: -33.5167, lng: -70.7667 },
    "Ñuñoa": { lat: -33.45, lng: -70.6 }, "Pedro Aguirre Cerda": { lat: -33.4833, lng: -70.6667 },
    "Peñalolén": { lat: -33.4833, lng: -70.5333 }, "Providencia": { lat: -33.4333, lng: -70.6167 },
    "Pudahuel": { lat: -33.4333, lng: -70.7667 }, "Quilicura": { lat: -33.3667, lng: -70.7333 },
    "Quinta Normal": { lat: -33.4333, lng: -70.6833 }, "Recoleta": { lat: -33.4, lng: -70.6333 },
    "Renca": { lat: -33.4, lng: -70.7333 }, "San Joaquín": { lat: -33.4833, lng: -70.6333 },
    "San Miguel": { lat: -33.5, lng: -70.65 }, "San Ramón": { lat: -33.5333, lng: -70.6333 },
    "Santiago": { lat: -33.4372, lng: -70.6506 }, "Vitacura": { lat: -33.4, lng: -70.6 },
    "Puente Alto": { lat: -33.6167, lng: -70.5833 }, "Pirque": { lat: -33.6333, lng: -70.5333 },
    "San José de Maipo": { lat: -33.65, lng: -70.35 }, "Colina": { lat: -33.2, lng: -70.6833 },
    "Lampa": { lat: -33.2833, lng: -70.8667 }, "Tiltil": { lat: -33.0833, lng: -70.9333 },
    "San Bernardo": { lat: -33.5833, lng: -70.7 }, "Buin": { lat: -33.7333, lng: -70.75 },
    "Calera de Tango": { lat: -33.6333, lng: -70.7833 }, "Paine": { lat: -33.8167, lng: -70.75 },
    "Melipilla": { lat: -33.6833, lng: -71.2167 }, "Alhué": { lat: -34.0333, lng: -71.1 },
    "Curacaví": { lat: -33.4, lng: -71.15 }, "María Pinto": { lat: -33.5167, lng: -71.1167 },
    "San Pedro": { lat: -33.9, lng: -71.4667 }, "Talagante": { lat: -33.6667, lng: -70.9333 },
    "El Monte": { lat: -33.6833, lng: -71.0167 }, "Isla de Maipo": { lat: -33.75, lng: -70.9 },
    "Padre Hurtado": { lat: -33.5667, lng: -70.8167 }, "Peñaflor": { lat: -33.6167, lng: -70.8833 }
};

const ResultadosBusqueda = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [prestadores, setPrestadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [listaOficios, setListaOficios] = useState([]);

  const [vista, setVista] = useState(searchParams.get('modo') || 'lista'); 
  const paramServicio = searchParams.get('servicio');
  const paramComuna = searchParams.get('comuna');
  
  const [oficio, setOficio] = useState(paramServicio ? paramServicio : 'Todos');
  const [comuna, setComuna] = useState(paramComuna ? paramComuna : 'Todas');
  const [radio, setRadio] = useState(searchParams.get('radio') || '5'); 
  
  const [dropdownComunaAbierto, setDropdownComunaAbierto] = useState(false);
  const [dropdownOficioAbierto, setDropdownOficioAbierto] = useState(false);
  const dropdownComunaRef = useRef(null);
  const dropdownOficioRef = useRef(null);

  const coordInicial = COORDS_COMUNAS[comuna !== 'Todas' ? comuna : 'Santiago'] || COORDS_COMUNAS["Santiago"];
  const [centroMapa, setCentroMapa] = useState(coordInicial);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownComunaRef.current && !dropdownComunaRef.current.contains(event.target)) setDropdownComunaAbierto(false);
      if (dropdownOficioRef.current && !dropdownOficioRef.current.contains(event.target)) setDropdownOficioAbierto(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetch('${import.meta.env.VITE_API_URL}/api/auth/oficios')
      .then(res => res.json())
      .then(data => { if(data.success) setListaOficios(data.oficios); })
      .catch(console.error);
  }, []);

  const realizarBusqueda = useCallback(async () => {
    setCargando(true);
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/auth/prestadores-publicos?modo=${vista}`;
      if (oficio !== 'Todos' && oficio !== '') url += `&servicio=${encodeURIComponent(oficio)}`;
      if (vista === 'mapa') url += `&lat=${centroMapa.lat}&lng=${centroMapa.lng}&radio=${radio}`;
      else if (comuna !== 'Todas' && comuna !== '') url += `&comuna=${encodeURIComponent(comuna)}`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) setPrestadores(data.prestadores);
    } catch (error) {
      console.error("Error al buscar prestadores:", error);
    } finally {
      setCargando(false);
    }
  }, [vista, oficio, comuna, radio, centroMapa]);

  useEffect(() => {
    const initBusqueda = async () => {
      await realizarBusqueda();
    };
    initBusqueda();
  }, [realizarBusqueda]);

  const seleccionarComuna = (nuevaComuna) => {
    setComuna(nuevaComuna);
    setDropdownComunaAbierto(false);
    if (nuevaComuna !== 'Todas' && COORDS_COMUNAS[nuevaComuna]) {
      setCentroMapa(COORDS_COMUNAS[nuevaComuna]);
    } else {
      setCentroMapa(COORDS_COMUNAS["Santiago"]); 
    }
  };

  const puedeBuscar = oficio !== '' && comuna !== '';

  const aplicarFiltrosManual = (e) => {
    e.preventDefault();
    if (!puedeBuscar) return;

    const params = new URLSearchParams();
    params.set('modo', vista);
    if (oficio !== 'Todos') params.set('servicio', oficio);
    if (comuna !== 'Todas') params.set('comuna', comuna);
    if (vista === 'mapa') params.set('radio', radio);
    
    setSearchParams(params);
    realizarBusqueda();
  };

  return (
    <div className="min-h-screen bg-[#f5f1ea] flex flex-col md:flex-row">
      <div className="w-full md:w-80 bg-white p-6 border-r border-gray-200 shadow-md z-10 flex flex-col">
        <h2 className="text-2xl font-extrabold text-[#1b3b2c] mb-6">Filtros</h2>
        
        <form onSubmit={aplicarFiltrosManual} className="space-y-6 flex-grow">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Modo de Búsqueda</label>
            <div className="flex bg-gray-100 p-1 rounded-md">
              <button type="button" onClick={() => setVista('lista')} className={`flex-1 py-2 text-sm font-bold rounded transition-all ${vista === 'lista' ? 'bg-[#1b3b2c] text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>Lista</button>
              <button type="button" onClick={() => setVista('mapa')} className={`flex-1 py-2 text-sm font-bold rounded transition-all ${vista === 'mapa' ? 'bg-[#1b3b2c] text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>Mapa</button>
            </div>
          </div>

          <div ref={dropdownOficioRef} className="relative">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Servicio Requerido</label>
            <div onClick={() => setDropdownOficioAbierto(!dropdownOficioAbierto)} className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-2.5 rounded-md text-sm font-semibold cursor-pointer flex justify-between items-center hover:border-[#1b3b2c] transition-colors">
              <span className={!oficio ? 'text-gray-500' : 'text-[#1b3b2c]'}>
                {oficio === 'Todos' ? 'Todos los oficios' : oficio || '¿Qué servicio necesitas?'}
              </span>
              <span className="text-gray-400 text-xs">▼</span>
            </div>
            {dropdownOficioAbierto && (
              <ul className="absolute z-50 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-2xl max-h-48 overflow-y-auto text-sm font-semibold">
                <li onClick={() => { setOficio('Todos'); setDropdownOficioAbierto(false); }} className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-[#1b3b2c] font-extrabold border-b border-gray-200">Todos los oficios</li>
                {listaOficios.map((of, idx) => (
                  <li key={idx} onClick={() => { setOficio(of); setDropdownOficioAbierto(false); }} className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-gray-700">{of}</li>
                ))}
              </ul>
            )}
          </div>

          <div ref={dropdownComunaRef} className="relative">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Comuna / Ubicación</label>
            <div onClick={() => setDropdownComunaAbierto(!dropdownComunaAbierto)} className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-2.5 rounded-md text-sm font-semibold cursor-pointer flex justify-between items-center hover:border-[#1b3b2c] transition-colors">
              <span className={!comuna ? 'text-gray-500' : 'text-[#1b3b2c]'}>
                {comuna === 'Todas' ? 'Todas las comunas (RM)' : comuna || 'Selecciona una comuna'}
              </span>
              <span className="text-gray-400 text-xs">▼</span>
            </div>
            {dropdownComunaAbierto && (
              <ul className="absolute z-50 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-2xl max-h-48 overflow-y-auto text-sm font-semibold">
                <li onClick={() => seleccionarComuna('Todas')} className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-[#1b3b2c] font-extrabold border-b border-gray-200">Todas las comunas (RM)</li>
                {COMUNAS_RM.map(c => (
                  <li key={c} onClick={() => seleccionarComuna(c)} className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-gray-700">{c}</li>
                ))}
              </ul>
            )}
          </div>

          {vista === 'mapa' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Radio de Búsqueda</label>
                <span className="text-xs font-extrabold text-[#1b3b2c] bg-[#e8c582] px-2 py-1 rounded">{radio} km</span>
              </div>
              <input type="range" min="1" max="50" step="1" value={radio} onChange={(e) => setRadio(e.target.value)} className="w-full accent-[#1b3b2c] cursor-pointer" />
              <p className="text-[10px] text-gray-400 mt-1 font-bold">Ajusta el radio o haz clic en el mapa para buscar en otra zona.</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={!puedeBuscar}
            className={`w-full py-3 rounded-md font-extrabold shadow-md transition-all text-sm mt-4 ${
              puedeBuscar 
              ? 'bg-[#e8c582] text-[#1b3b2c] hover:bg-opacity-90' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Aplicar Filtros
          </button>
        </form>
      </div>

      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1b3b2c]">Técnicos Disponibles</h1>
            <p className="text-sm text-gray-600 font-semibold mt-1">Mostrando {prestadores.length} resultado(s) {oficio && oficio !== 'Todos' ? `para ${oficio}` : ''}</p>
          </div>
        </div>

        {cargando ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#1b3b2c]"></div></div>
        ) : vista === 'lista' ? (
          prestadores.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center"><span className="text-5xl block mb-4">🔍</span><h3 className="text-xl font-extrabold text-[#1b3b2c] mb-2">No se encontraron prestadores</h3><p className="text-sm text-gray-500 max-w-md mx-auto">Intenta ampliar el radio de búsqueda en el mapa, o seleccionar "Todos los oficios".</p></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {prestadores.map(prestador => (
                <div key={prestador._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
                  <div className="p-5 flex gap-4 items-center border-b border-gray-100 bg-gray-50">
                    <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-[#e8c582] overflow-hidden flex-shrink-0 relative">
                      {prestador.fotoPerfil ? (
                        <img src={prestador.fotoPerfil.startsWith('http') ? prestador.fotoPerfil : `http://localhost:5000/${prestador.fotoPerfil}`} alt="Perfil" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-extrabold text-2xl text-gray-500">{prestador.nombre.charAt(0)}</div>
                      )}
                    </div>
                    <div>
                      {/* --- INSIGNIA DE VERIFICACIÓN AQUÍ --- */}
                      <h3 className="font-extrabold text-[#1b3b2c] text-lg leading-tight flex items-center gap-1.5">
                        {prestador.tituloTienda || prestador.nombre}
                        {prestador.isVerified && <InsigniaVerificada className="w-4 h-4 flex-shrink-0" />}
                      </h3>
                      <p className="text-xs text-gray-500 font-bold">{prestador.oficio}</p>
                      <div className="flex items-center gap-1 mt-1 text-sm"><span className="text-[#e8c582]">⭐</span><span className="font-bold text-gray-700">{prestador.calificacionPromedio || '0.0'}</span><span className="text-xs text-gray-400">({prestador.numeroResenas} reseñas)</span></div>
                    </div>
                  </div>
                  <div className="p-5 flex-grow">
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">{prestador.biografia || 'Sin descripción disponible.'}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold bg-gray-50 p-2 rounded"><span className="text-lg">💰</span><span className="truncate">Tarifa ref: <strong className="text-[#1b3b2c]">{prestador.tarifaReferencia}</strong></span></div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold bg-gray-50 p-2 rounded"><span className="text-lg">📍</span><span>Atención: <strong className="text-[#1b3b2c]">{prestador.tipoAtencion}</strong></span></div>
                    </div>
                  </div>
                  <div className="p-5 pt-0 mt-auto">
                    <Link to={`/prestador/${prestador._id}`} className="block w-full text-center bg-[#1b3b2c] text-white py-2.5 rounded-md font-bold text-sm hover:bg-opacity-90 shadow-sm transition-all">Ver Perfil Completo</Link>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="bg-white p-2 rounded-lg shadow-md border border-gray-200 h-[75vh] w-full relative z-0">
            {prestadores.length === 0 && (
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[1000] bg-white px-6 py-4 rounded-lg shadow-2xl border-2 border-red-400 text-center pointer-events-none"><span className="text-3xl block mb-2">🔍</span><h3 className="font-extrabold text-red-600 text-lg">Sin resultados aquí</h3><p className="text-xs font-bold text-gray-600 mt-1">Haz clic en otra zona o amplía el radio.</p></div>
            )}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-[#1b3b2c] px-4 py-2 rounded-full shadow-lg border border-[#e8c582] text-xs font-bold text-white flex items-center gap-2 pointer-events-none">👆 Haz clic en cualquier parte del mapa para buscar allí</div>

            <MapContainer center={[centroMapa.lat, centroMapa.lng]} zoom={13} className="w-full h-full rounded-md z-0">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapUpdater center={[centroMapa.lat, centroMapa.lng]} animate={true} />
              <ClickSearcher setCenter={setCentroMapa} />
              <Circle center={[centroMapa.lat, centroMapa.lng]} radius={radio * 1000} pathOptions={{ color: prestadores.length === 0 ? '#ef4444' : '#1b3b2c', fillColor: prestadores.length === 0 ? '#fee2e2' : '#e8c582', fillOpacity: 0.15, weight: 2 }} />
              {prestadores.map(prestador => (
                prestador.localesFisicos?.map((local, idx) => {
                  if (!local.ubicacion?.coordinates) return null;
                  return (
                    <Marker key={`${prestador._id}-${idx}`} position={[local.ubicacion.coordinates[1], local.ubicacion.coordinates[0]]} icon={marcadorRojo}>
                      <Popup className="custom-popup">
                        <div className="text-center p-1">
                          <h3 className="font-extrabold text-[#1b3b2c] text-sm mb-1">{prestador.tituloTienda || prestador.nombre}</h3>
                          <p className="text-xs font-bold text-gray-500 mb-2">{prestador.oficio}</p>
                          <div className="text-xs bg-gray-50 p-1.5 rounded border border-gray-100 mb-3 text-gray-700">{local.direccion} {local.numero}, {local.comuna}</div>
                          <Link to={`/prestador/${prestador._id}`} className="block w-full bg-[#e8c582] text-[#1b3b2c] py-1.5 rounded text-xs font-extrabold hover:bg-opacity-90 shadow-sm">Ver Perfil</Link>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultadosBusqueda;