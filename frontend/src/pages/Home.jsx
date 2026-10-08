import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMUNAS_RM } from '../data/comunas';

const Home = () => {
  const [listaOficios, setListaOficios] = useState([]);
  const [servicio, setServicio] = useState('');
  const [comuna, setComuna] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/auth/oficios')
      .then(res => res.json())
      .then(data => {
        if (data.success) setListaOficios(data.oficios);
      })
      .catch(err => console.error('Error cargando oficios', err));
  }, []);

  const handleBuscar = () => {
    navigate(`/resultados?servicio=${encodeURIComponent(servicio)}&comuna=${encodeURIComponent(comuna)}`);
  };

  return (
    <main className="w-full">
      <section className="bg-[#1b3b2c] text-[#f5f1ea] py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6 text-sm md:text-base text-gray-300 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            REGIÓN METROPOLITANA, SANTIAGO DE CHILE
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-[#e8c582]">
            El técnico que <br /> necesitas, verificado <br /> y cerca de ti.
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl leading-relaxed">
            Conectamos a técnicos locales con identidad verificada con residentes en Santiago. Sin búsquedas en Facebook, sin riesgos, sin incertidumbre.
          </p>

          <div className="bg-[#f5f1ea] p-2 md:p-3 rounded-lg shadow-xl max-w-3xl flex flex-col md:flex-row gap-2">
            <div className="flex-1 bg-white flex items-center px-4 py-3 rounded-md border border-gray-200">
              <span className="text-gray-400 mr-2">🔍</span>
              <select 
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-800 font-semibold cursor-pointer"
              >
                <option value="">¿Qué servicio necesitas?</option>
                {listaOficios.map(oficio => (
                  <option key={oficio} value={oficio}>{oficio}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 bg-white flex items-center px-4 py-3 rounded-md border border-gray-200">
              <span className="text-gray-400 mr-2">📍</span>
              <select 
                value={comuna}
                onChange={(e) => setComuna(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-800 font-semibold cursor-pointer"
              >
                <option value="">Todas las comunas (RM)</option>
                {COMUNAS_RM.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleBuscar}
              className="bg-[#1b3b2c] hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-md transition-all"
            >
              Buscar
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;