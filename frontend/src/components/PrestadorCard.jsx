import { useNavigate } from 'react-router-dom';
import { calcularDistanciaKm } from '../utils/geoUtils';

const PrestadorCard = ({ p, modoLocal, mapCenter, radioLocal }) => {
  const navigate = useNavigate();

  // Filtrar locales dentro del radio solo si estamos en modo "mapa"
  const localesEnRadio = modoLocal === 'mapa' 
    ? p.localesFisicos?.filter(loc => {
        if (!loc.ubicacion?.coordinates) return false;
        const dist = calcularDistanciaKm(mapCenter.lat, mapCenter.lng, loc.ubicacion.coordinates[1], loc.ubicacion.coordinates[0]);
        return dist <= parseFloat(radioLocal);
      })
    : p.localesFisicos;

  // En modo mapa, si no tiene locales en el radio, ocultamos la tarjeta
  if (modoLocal === 'mapa' && (!localesEnRadio || localesEnRadio.length === 0)) return null;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow flex flex-col relative pt-4">
      
      {/* GLOBOS DE MODALIDAD: Se muestran 2 globos independientes si atiende en ambas */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        {(p.tipoAtencion === 'A domicilio' || p.tipoAtencion === 'Ambas') && (
          <span className="bg-[#e8c582] text-[#1b3b2c] text-xs font-extrabold px-2.5 py-1 rounded shadow-sm">
            A domicilio
          </span>
        )}
        {(p.tipoAtencion === 'En local' || p.tipoAtencion === 'Ambas') && (
          <span className="bg-[#1b3b2c] text-[#e8c582] text-xs font-extrabold px-2.5 py-1 rounded shadow-sm border border-[#1b3b2c]">
            Local
          </span>
        )}
      </div>

      <div className="p-6 flex-grow mt-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 border border-[#1b3b2c] overflow-hidden flex-shrink-0 relative">
            {p.fotoPerfil ? (
              <img src={p.fotoPerfil.startsWith('http') ? p.fotoPerfil : `http://localhost:5000/${p.fotoPerfil}`} alt={p.nombre} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-bold">{p.nombre.charAt(0)}</div>
            )}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-lg font-extrabold leading-tight truncate pr-16">{p.tituloTienda || p.nombre}</h3>
            <p className="text-xs text-gray-600 font-bold">{p.oficio}</p>
            <p className="text-xs text-gray-500 mt-1 font-semibold">⭐ {p.calificacionPromedio} ({p.numeroResenas} reseñas)</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md text-xs border border-gray-100 space-y-2">
          <p><span className="font-bold text-gray-500">Tarifa ref:</span> <span className="font-extrabold text-[#1b3b2c]">{p.tarifaReferencia}</span></p>
          
          {/* Mostramos cobertura si hace domicilios */}
          {(p.tipoAtencion === 'A domicilio' || p.tipoAtencion === 'Ambas') && (
            <p className="truncate"><span className="font-bold text-gray-500">Cobertura:</span> <span className="font-extrabold text-[#1b3b2c]">{p.zonaCobertura?.length > 0 ? p.zonaCobertura.join(', ') : 'N/A'}</span></p>
          )}
          
          {/* Mostramos locales si tiene un taller físico */}
          {(p.tipoAtencion === 'En local' || p.tipoAtencion === 'Ambas') && p.localesFisicos?.length > 0 && (
            <div>
              <span className="font-bold text-gray-500 block mb-1">
                {modoLocal === 'mapa' ? 'Locales en esta área:' : 'Locales registrados:'}
              </span>
              {(modoLocal === 'mapa' ? localesEnRadio : p.localesFisicos)?.map((local, idx) => (
                <div key={idx} className="bg-white px-2 py-1.5 rounded border border-gray-200 mb-1 truncate text-gray-700">
                  <span className="font-extrabold text-[#1b3b2c]">{local.nombreLocal || 'Local'}:</span> {local.direccion} {local.numero}
                  {/* Si estamos en Lista, agregamos la comuna para dar más contexto */}
                  {modoLocal === 'lista' && `, ${local.comuna}`}
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
};

export default PrestadorCard;