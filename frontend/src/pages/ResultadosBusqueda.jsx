import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { COMUNAS_RM } from '../data/comunas';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix universal para los iconos de Leaflet en React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Fórmula matemática (Haversine) para medir distancias exactas en kilómetros entre dos coordenadas
const calcularDistanciaKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// Componente para actualizar la vista del mapa cuando cambian las coordenadas
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

// Componente para que el cliente seleccione el centro de su búsqueda haciendo clic
const ClickSearcher = ({ setCenter }) => {
  useMapEvents({
    click(e) {
      setCenter({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
};

const ResultadosBusqueda = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Inicializar estado local directamente desde la URL
  const [servicioLocal, setServicioLocal] = useState(searchParams.get('servicio') || '');
  const [comunaLocal, setComunaLocal] = useState(searchParams.get('comuna') || '');
  const [modoLocal, setModoLocal] = useState(searchParams.get('modo') || 'domicilio'); 
  const [radioLocal, setRadioLocal] = useState(searchParams.get('radio') || '5'); 
  const [mapCenter, setMapCenter] = useState({ 
    lat: parseFloat(searchParams.get('lat')) || -33.4372, 
    lng: parseFloat(searchParams.get('lng')) || -70.6506 
  });

  const [prestadores, setPrestadores] = useState([]);
  const [listaOficios, setListaOficios] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Efecto principal encapsulado para la llamada a la API y prevenir memory leaks
  useEffect(() => {
    let ignore = false;
    
    const fetchDatos = async () => {
      setCargando(true);
      
      const urlModo = searchParams.get('modo') || 'domicilio';
      const urlServicio = searchParams.get('servicio') || '';
      const urlComuna = searchParams.get('comuna') || '';
      const urlRadio = searchParams.get('radio') || '5';
      const urlLat = parseFloat(searchParams.get('lat')) || -33.4372;
      const urlLng = parseFloat(searchParams.get('lng')) || -70.6506;

      let urlBusqueda = `http://localhost:5000/api/auth/prestadores-publicos?modo=${urlModo}&servicio=${encodeURIComponent(urlServicio)}`;
      
      if (urlModo === 'local') {
        urlBusqueda += `&lat=${urlLat}&lng=${urlLng}&radio=${urlRadio}`;
      } else if (urlModo === 'domicilio' && urlComuna) {
        urlBusqueda += `&comuna=${encodeURIComponent(urlComuna)}`;
      }

      try {
        const [resPrestadores, resOficios] = await Promise.all([
          fetch(urlBusqueda),
          fetch('http://localhost:5000/api/auth/oficios')
        ]);
        const dataPrestadores = await resPrestadores.json();
        const dataOficios = await resOficios.json();
        
        if (!ignore) {
          if (dataPrestadores.success) setPrestadores(dataPrestadores.prestadores);
          if (dataOficios.success) setListaOficios(dataOficios.oficios);
        }
      } catch (err) {
        console.error('Error cargando datos', err);
      } finally {
        if (!ignore) setCargando(false);
      }
    };

    fetchDatos();
    return () => { ignore = true; };
  }, [searchParams]);

  const handleActualizarBusqueda = () => {
    if (modoLocal === 'local') {
      setSearchParams({ modo: 'local', servicio: servicioLocal, radio: radioLocal, lat: mapCenter.lat, lng: mapCenter.lng });
    } else {
      setSearchParams({ modo: 'domicilio', servicio: servicioLocal, comuna: comunaLocal });
    }
  };

  const prestadoresOrdenados = [...prestadores].sort((a, b) => {
    if (b.calificacionPromedio !== a.calificacionPromedio) return b.calificacionPromedio - a.calificacionPromedio;
    return b.numeroResenas - a.numeroResenas;
  });

  return (
    <div className="min-h-screen bg-[#f5f1ea] p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* PESTAÑAS (TABS) PARA LAS 2 VARIANTES DE BÚSQUEDA */}
        <div className="flex mb-6 bg-gray-200 p-1 rounded-t-lg max-w-md mx-auto md:mx-0">
          <button 
            onClick={() => { setModoLocal('domicilio'); setSearchParams({ modo: 'domicilio', servicio: servicioLocal, comuna: comunaLocal }); }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all ${modoLocal === 'domicilio' ? 'bg-white shadow text-[#1b3b2c]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            🏠 A Domicilio
          </button>
          <button 
            onClick={() => { setModoLocal('local'); setSearchParams({ modo: 'local', servicio: servicioLocal, lat: mapCenter.lat, lng: mapCenter.lng, radio: radioLocal }); }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all ${modoLocal === 'local' ? 'bg-white shadow text-[#1b3b2c]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            📍 Local Físico (Mapa)
          </button>
        </div>

        {/* BARRA DE BÚSQUEDA */}
        <div className="bg-white p-4 rounded-lg rounded-tl-none md:rounded-tl-lg shadow-md mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 bg-[#f5f1ea] flex items-center px-4 py-2.5 rounded-md border border-gray-300 focus-within:border-[#1b3b2c] transition-colors">
              <span className="text-gray-400 mr-2">🔍</span>
              <select value={servicioLocal} onChange={(e) => setServicioLocal(e.target.value)} className="w-full bg-transparent outline-none font-semibold cursor-pointer">
                <option value="">Cualquier servicio</option>
                {listaOficios.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {modoLocal === 'domicilio' ? (
              <div className="flex-1 bg-[#f5f1ea] flex items-center px-4 py-2.5 rounded-md border border-gray-300 focus-within:border-[#1b3b2c] transition-colors">
                <span className="text-gray-400 mr-2">📍</span>
                <select value={comunaLocal} onChange={(e) => setComunaLocal(e.target.value)} className="w-full bg-transparent outline-none font-semibold cursor-pointer">
                  <option value="">Todas las comunas (RM)</option>
                  {COMUNAS_RM.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            ) : (
              <div className="flex-1 bg-[#f5f1ea] flex items-center px-4 py-2.5 rounded-md border border-gray-300 focus-within:border-[#1b3b2c] transition-colors">
                <span className="text-gray-400 mr-2">🎯</span>
                <select value={radioLocal} onChange={(e) => setRadioLocal(e.target.value)} className="w-full bg-transparent outline-none font-semibold cursor-pointer">
                  <option value="2">Radio de 2 km</option>
                  <option value="5">Radio de 5 km</option>
                  <option value="10">Radio de 10 km</option>
                  <option value="20">Radio de 20 km</option>
                </select>
              </div>
            )}

            <button onClick={handleActualizarBusqueda} className="bg-[#1b3b2c] hover:bg-opacity-90 text-white font-bold py-2.5 px-8 rounded-md shadow-sm transition-all">
              Buscar
            </button>
          </div>

          {/* MAPA INTERACTIVO DEL BUSCADOR */}
          {modoLocal === 'local' && (
            <div className="w-full h-[400px] rounded-md border border-gray-300 relative z-0 overflow-hidden shadow-inner">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-[1000] bg-[#1b3b2c] text-white px-5 py-2 text-xs font-bold rounded-full shadow-lg pointer-events-none">
                Haz clic en el mapa para establecer el centro de tu búsqueda
              </div>
              <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={13} style={{ width: '100%', height: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                <MapUpdater center={[mapCenter.lat, mapCenter.lng]} />
                <ClickSearcher setCenter={setMapCenter}/>
                
                {/* Pin central de búsqueda */}
                <Marker position={[mapCenter.lat, mapCenter.lng]} />
                
                {/* Círculo que delimita visualmente el radio */}
                <Circle 
                  center={[mapCenter.lat, mapCenter.lng]} 
                  radius={parseFloat(radioLocal) * 1000} 
                  pathOptions={{ color: '#1b3b2c', fillColor: '#1b3b2c', fillOpacity: 0.1, weight: 2 }}
                />

                {/* Renderizar pines de los técnicos de forma condicional */}
                {prestadoresOrdenados.map(p => 
                  p.localesFisicos?.map((loc, idx) => {
                    if (!loc.ubicacion?.coordinates) return null;
                    
                    const latLocal = loc.ubicacion.coordinates[1];
                    const lngLocal = loc.ubicacion.coordinates[0];
                    
                    // Solo dibujamos el pin si la distancia real es menor o igual al radio seleccionado
                    const distancia = calcularDistanciaKm(mapCenter.lat, mapCenter.lng, latLocal, lngLocal);
                    if (distancia > parseFloat(radioLocal)) return null;

                    return (
                      <Marker key={`${p._id}-${idx}`} position={[latLocal, lngLocal]}>
                        <Popup>
                          <div className="text-center min-w-[150px]">
                            <h4 className="font-extrabold text-[#1b3b2c] text-sm mb-1">{p.tituloTienda || p.nombre}</h4>
                            <p className="text-xs font-semibold text-gray-500 mb-1">{p.oficio} • ⭐ {p.calificacionPromedio}</p>
                            <hr className="my-1 border-gray-200" />
                            <p className="text-xs text-gray-700 mb-3">{loc.direccion} {loc.numero}, <span className="font-bold">{loc.comuna}</span></p>
                            <button 
                              onClick={() => navigate(`/prestador/${p._id}`)} 
                              className="w-full bg-[#e8c582] text-[#1b3b2c] text-xs font-extrabold py-1.5 rounded hover:bg-opacity-90 transition-all"
                            >
                              Ver Ficha y Contratar
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })
                )}
              </MapContainer>
            </div>
          )}
        </div>

        {cargando ? (
          <p className="text-center font-bold text-gray-500 py-10">Buscando profesionales...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prestadoresOrdenados.length > 0 ? (
              prestadoresOrdenados.map((p) => {
                // Para las tarjetas inferiores, filtramos los locales que están dentro del radio
                const localesEnRadio = modoLocal === 'local' 
                  ? p.localesFisicos?.filter(loc => {
                      if (!loc.ubicacion?.coordinates) return false;
                      const dist = calcularDistanciaKm(mapCenter.lat, mapCenter.lng, loc.ubicacion.coordinates[1], loc.ubicacion.coordinates[0]);
                      return dist <= parseFloat(radioLocal);
                    })
                  : p.localesFisicos;

                // Si está buscando por mapa y el prestador no tiene ningún local dentro de ese radio, no mostramos la tarjeta
                if (modoLocal === 'local' && (!localesEnRadio || localesEnRadio.length === 0)) return null;

                return (
                  <div key={p._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow flex flex-col relative">
                    <div className="absolute top-4 right-4 bg-[#e8c582] text-[#1b3b2c] text-xs font-extrabold px-2.5 py-1 rounded shadow-sm z-10">{p.tipoAtencion}</div>
                    <div className="p-6 flex-grow">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 border border-[#1b3b2c] overflow-hidden flex-shrink-0 relative">
                          {p.fotoPerfil ? <img src={p.fotoPerfil.startsWith('http') ? p.fotoPerfil : `http://localhost:5000/${p.fotoPerfil}`} alt={p.nombre} className="absolute inset-0 w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl font-bold">{p.nombre.charAt(0)}</div>}
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="text-lg font-extrabold leading-tight truncate pr-16">{p.tituloTienda || p.nombre}</h3>
                          <p className="text-xs text-gray-600 font-bold">{p.oficio}</p>
                          <p className="text-xs text-gray-500 mt-1 font-semibold">⭐ {p.calificacionPromedio} ({p.numeroResenas} reseñas)</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md text-xs border border-gray-100 space-y-2">
                        <p><span className="font-bold text-gray-500">Tarifa ref:</span> <span className="font-extrabold text-[#1b3b2c]">{p.tarifaReferencia}</span></p>
                        
                        {(p.tipoAtencion === 'A domicilio' || p.tipoAtencion === 'Ambas') && modoLocal === 'domicilio' && (
                          <p className="truncate"><span className="font-bold text-gray-500">Cobertura:</span> <span className="font-extrabold text-[#1b3b2c]">{p.zonaCobertura?.length > 0 ? p.zonaCobertura.join(', ') : 'N/A'}</span></p>
                        )}
                        
                        {(p.tipoAtencion === 'En local' || p.tipoAtencion === 'Ambas') && modoLocal === 'local' && (
                          <div>
                            <span className="font-bold text-gray-500 block mb-1">Locales en esta área:</span>
                            {localesEnRadio?.map((local, idx) => (
                              <div key={idx} className="bg-white px-2 py-1.5 rounded border border-gray-200 mb-1 truncate text-gray-700">
                                <span className="font-extrabold text-[#1b3b2c]">{local.nombreLocal || 'Local'}:</span> {local.direccion} {local.numero}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                      <button onClick={() => navigate(`/prestador/${p._id}`)} className="w-full bg-[#1b3b2c] text-white font-bold py-2.5 rounded-md shadow-sm hover:bg-opacity-90 transition-all">
                        Ver Ficha Pública
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
                <span className="text-4xl block mb-4">📍</span>
                <h3 className="text-xl font-extrabold text-gray-700 mb-2">No hay locales cerca</h3>
                <p className="text-gray-500 max-w-md mx-auto">Haz clic en otra zona del mapa o amplía el radio de búsqueda.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultadosBusqueda;