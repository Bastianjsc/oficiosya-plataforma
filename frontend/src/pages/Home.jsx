import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { COMUNAS_RM, COORDENADAS_RM } from '../data/comunas';

const Home = () => {
  const [servicio, setServicio] = useState(''); // '' = No seleccionado
  const [comuna, setComuna] = useState('');     // '' = No seleccionado
  const [modo, setModo] = useState('domicilio'); 
  const [listaOficios, setListaOficios] = useState([]);
  const navigate = useNavigate();

  const [dropdownServicioAbierto, setDropdownServicioAbierto] = useState(false);
  const [dropdownComunaAbierto, setDropdownComunaAbierto] = useState(false);
  const dropdownServicioRef = useRef(null);
  const dropdownComunaRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownServicioRef.current && !dropdownServicioRef.current.contains(event.target)) setDropdownServicioAbierto(false);
      if (dropdownComunaRef.current && !dropdownComunaRef.current.contains(event.target)) setDropdownComunaAbierto(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/auth/oficios`)
      .then(res => res.json())
      .then(data => { if (data.success) setListaOficios(data.oficios); })
      .catch(err => console.error("Error cargando oficios:", err));
  }, []);

  // Validación: El botón solo se habilita si AMBOS campos tienen una selección válida
  const puedeBuscar = servicio !== '' && comuna !== '';

  const handleBuscar = (e) => {
    e.preventDefault();
    if (!puedeBuscar) return;

    // Si el usuario seleccionó "Todos", mandamos un string vacío a la URL para que no filtre
    const queryServicio = servicio === 'Todos' ? '' : servicio;
    const queryComuna = comuna === 'Todas' ? '' : comuna;

    if (modo === 'domicilio') {
      navigate(`/buscar?modo=lista&servicio=${encodeURIComponent(queryServicio)}&comuna=${encodeURIComponent(queryComuna)}`);
    } else {
      if (comuna !== 'Todas' && COORDENADAS_RM[comuna]) {
        const { lat, lng } = COORDENADAS_RM[comuna];
        navigate(`/buscar?modo=mapa&servicio=${encodeURIComponent(queryServicio)}&lat=${lat}&lng=${lng}&radio=5`);
      } else {
        navigate(`/buscar?modo=mapa&servicio=${encodeURIComponent(queryServicio)}&lat=-33.4372&lng=-70.6506&radio=5`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f1ea] flex flex-col">
      <section className="relative bg-[#1b3b2c] py-20 px-8 flex-grow flex flex-col justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 opacity-10">
              <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#e8c582] rounded-full blur-3xl"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#f5f1ea] rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto w-full relative z-20 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Encuentra al profesional <br className="hidden md:block" />
            <span className="text-[#e8c582]">ideal para tu proyecto</span>
          </h1>
          <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto font-medium">
            Mecánicos, electricistas, informáticos y más. Contrata servicios verificados a domicilio o visita sus locales físicos en toda la Región Metropolitana.
          </p>

          <div className="bg-white p-2 rounded-xl shadow-2xl max-w-4xl mx-auto">
            <div className="flex mb-2 bg-gray-100 rounded-lg p-1">
              <button type="button" onClick={() => setModo('domicilio')} className={`flex-1 py-3 px-4 rounded-md text-sm md:text-base font-extrabold transition-all ${modo === 'domicilio' ? 'bg-white shadow text-[#1b3b2c]' : 'text-gray-500 hover:text-gray-800'}`}>🏠 Atención a Domicilio</button>
              <button type="button" onClick={() => setModo('local')} className={`flex-1 py-3 px-4 rounded-md text-sm md:text-base font-extrabold transition-all ${modo === 'local' ? 'bg-white shadow text-[#1b3b2c]' : 'text-gray-500 hover:text-gray-800'}`}>📍 Visitar Local (Mapa)</button>
            </div>

            <form onSubmit={handleBuscar} className="flex flex-col md:flex-row gap-3 p-2 relative">
              <div ref={dropdownServicioRef} className="flex-1 bg-[#f5f1ea] relative rounded-lg border border-gray-300 focus-within:border-[#1b3b2c] transition-colors">
                <div onClick={() => setDropdownServicioAbierto(!dropdownServicioAbierto)} className="w-full h-full flex items-center px-4 py-3 cursor-pointer">
                  <span className="text-gray-400 mr-3 text-xl">🔍</span>
                  <span className={`w-full text-left font-bold ${servicio ? 'text-gray-800' : 'text-gray-500'}`}>
                    {servicio === 'Todos' ? 'Todos los oficios' : servicio || '¿Qué servicio necesitas?'}
                  </span>
                  <span className="text-gray-400 text-xs ml-2">▼</span>
                </div>
                {dropdownServicioAbierto && (
                  <ul className="absolute z-50 left-0 top-[105%] w-full bg-white border border-gray-300 rounded-md shadow-2xl max-h-48 overflow-y-auto text-sm font-semibold text-left">
                    <li onClick={() => { setServicio('Todos'); setDropdownServicioAbierto(false); }} className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-[#1b3b2c] font-extrabold border-b border-gray-200">Todos los oficios</li>
                    {listaOficios.map(o => (
                      <li key={o} onClick={() => { setServicio(o); setDropdownServicioAbierto(false); }} className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-gray-700">{o}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div ref={dropdownComunaRef} className="flex-1 bg-[#f5f1ea] relative rounded-lg border border-gray-300 focus-within:border-[#1b3b2c] transition-colors">
                <div onClick={() => setDropdownComunaAbierto(!dropdownComunaAbierto)} className="w-full h-full flex items-center px-4 py-3 cursor-pointer">
                  <span className="text-gray-400 mr-3 text-xl">{modo === 'local' ? '🎯' : '📍'}</span>
                  <span className={`w-full text-left font-bold ${comuna ? 'text-gray-800' : 'text-gray-500'}`}>
                    {comuna === 'Todas' ? 'Todas las comunas (RM)' : comuna || (modo === 'local' ? '¿En qué comuna estás?' : 'Selecciona una comuna')}
                  </span>
                  <span className="text-gray-400 text-xs ml-2">▼</span>
                </div>
                {dropdownComunaAbierto && (
                  <ul className="absolute z-50 left-0 top-[105%] w-full bg-white border border-gray-300 rounded-md shadow-2xl max-h-48 overflow-y-auto text-sm font-semibold text-left">
                    <li onClick={() => { setComuna('Todas'); setDropdownComunaAbierto(false); }} className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-[#1b3b2c] font-extrabold border-b border-gray-200">Todas las comunas (RM)</li>
                    {COMUNAS_RM.map(c => (
                      <li key={c} onClick={() => { setComuna(c); setDropdownComunaAbierto(false); }} className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-gray-700">{c}</li>
                    ))}
                  </ul>
                )}
              </div>

              <button 
                type="submit" 
                disabled={!puedeBuscar}
                className={`font-extrabold text-lg py-3 px-10 rounded-lg transition-all ${
                  puedeBuscar 
                  ? 'bg-[#1b3b2c] hover:bg-opacity-90 text-white shadow-md' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Buscar
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-white relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-[#1b3b2c] mb-12">¿Cómo funciona OficiosYa?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-6"><div className="w-20 h-20 mx-auto bg-[#f5f1ea] rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm border border-[#e8c582]">🔍</div><h3 className="text-xl font-extrabold text-[#1b3b2c] mb-3">Busca y Compara</h3><p className="text-gray-600 font-medium">Revisa perfiles, calificaciones y tarifas de profesionales cercanos a ti.</p></div>
            <div className="p-6"><div className="w-20 h-20 mx-auto bg-[#f5f1ea] rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm border border-[#e8c582]">💬</div><h3 className="text-xl font-extrabold text-[#1b3b2c] mb-3">Solicita Presupuesto</h3><p className="text-gray-600 font-medium">Envía los detalles de tu problema y recibe cotizaciones digitales detalladas.</p></div>
            <div className="p-6"><div className="w-20 h-20 mx-auto bg-[#f5f1ea] rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm border border-[#e8c582]">⭐</div><h3 className="text-xl font-extrabold text-[#1b3b2c] mb-3">Evalúa el Servicio</h3><p className="text-gray-600 font-medium">Al finalizar, califica el trabajo para mantener nuestra comunidad segura y confiable.</p></div>
          </div>
        </div>
      </section>

      <section className="py-16 px-8 bg-[#e8c582] relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-[#1b3b2c] mb-4">¿Eres un profesional?</h2>
          <p className="text-lg text-[#1b3b2c] font-medium mb-8">Únete a nuestra plataforma, digitaliza tus presupuestos, añade la ubicación de tu local en nuestro mapa y aumenta tu base de clientes hoy mismo.</p>
          <Link to="/registro" className="inline-block bg-[#1b3b2c] text-white font-extrabold py-3.5 px-8 rounded-lg shadow-lg hover:bg-opacity-90 transition-all text-lg">Crear mi perfil profesional</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;