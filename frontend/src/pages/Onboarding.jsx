import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMUNAS_RM } from '../data/comunas';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { MapUpdater, MapPicker } from '../components/MapHelpers';
import Alert from '../components/Alert';

const Onboarding = () => {
  const navigate = useNavigate();
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  
  const [formData, setFormData] = useState({ 
    tituloTienda: '', biografia: '', tarifaReferencia: '', zonaCobertura: [], tipoAtencion: 'A domicilio', localesFisicos: [] 
  });
  const [fotoArchivo, setFotoArchivo] = useState(null);
  const [buscandoMapa, setBuscandoMapa] = useState(false);

  const [dropdownZonaAbierto, setDropdownZonaAbierto] = useState(false);
  const [dropdownLocalAbierto, setDropdownLocalAbierto] = useState(null);
  const dropdownZonaRef = useRef(null);
  const dropdownLocalesRef = useRef(null);
  const [busquedaComuna, setBusquedaComuna] = useState('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownZonaRef.current && !dropdownZonaRef.current.contains(event.target)) {
        setDropdownZonaAbierto(false);
        setBusquedaComuna('');
      }
      if (dropdownLocalesRef.current && !dropdownLocalesRef.current.contains(event.target)) setDropdownLocalAbierto(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFotoChange = (e) => { if (e.target.files && e.target.files[0]) setFotoArchivo(e.target.files[0]); };
  
  const handleAgregarComuna = (val) => {
    if (val && !formData.zonaCobertura.includes(val)) {
      setFormData({ ...formData, zonaCobertura: [...formData.zonaCobertura, val] });
    }
    setDropdownZonaAbierto(false);
    setBusquedaComuna('');
  };

  const handleAgregarTodasLasComunas = () => {
    setFormData({ ...formData, zonaCobertura: [...COMUNAS_RM] });
    setDropdownZonaAbierto(false);
    setBusquedaComuna('');
  };

  const handleQuitarTodasLasComunas = () => {
    setFormData({ ...formData, zonaCobertura: [] });
  };

  const handleRemoverComuna = (val) => setFormData({ ...formData, zonaCobertura: formData.zonaCobertura.filter(c => c !== val) });

  const agregarLocal = () => setFormData({ ...formData, localesFisicos: [...formData.localesFisicos, { nombreLocal: '', direccion: '', numero: '', comuna: '', lat: -33.4372, lng: -70.6506 }] });
  const removerLocal = (index) => {
    const nuevosLocales = [...formData.localesFisicos];
    nuevosLocales.splice(index, 1);
    setFormData({ ...formData, localesFisicos: nuevosLocales });
  };
  const handleLocalChange = (index, campo, valor) => {
    const nuevosLocales = [...formData.localesFisicos];
    nuevosLocales[index][campo] = valor;
    setFormData({ ...formData, localesFisicos: nuevosLocales });
  };
  const handleMapCoords = (index, lat, lng) => {
    const nuevosLocales = [...formData.localesFisicos];
    nuevosLocales[index].lat = lat;
    nuevosLocales[index].lng = lng;
    setFormData({ ...formData, localesFisicos: nuevosLocales });
  };

  const buscarDireccionEnMapa = async (index) => {
    const local = formData.localesFisicos[index];
    if (!local.direccion || !local.numero || !local.comuna) return alert("Ingresa calle, número y comuna primero.");
    setBuscandoMapa(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${local.direccion} ${local.numero},${local.comuna}, Chile`)}`);
      const data = await response.json();
      if (data && data.length > 0) handleMapCoords(index, parseFloat(data[0].lat), parseFloat(data[0].lon));
      else alert("No encontramos la numeración exacta. Ajusta el pin manualmente.");
    } catch (error) { console.error("Error al buscar mapa:", error); } finally { setBuscandoMapa(false); }
  };

  const handleSubmitPaso1 = async (e) => {
    e.preventDefault();
    if (formData.tipoAtencion === 'En local' && formData.localesFisicos.length === 0) return setMensaje({ texto: 'Debes agregar al menos un local físico.', tipo: 'error' });
    if (formData.tipoAtencion === 'A domicilio' && formData.zonaCobertura.length === 0) return setMensaje({ texto: 'Debes seleccionar al menos una comuna de cobertura.', tipo: 'error' });

    setProcesando(true);
    setMensaje({ texto: 'Guardando tu perfil...', tipo: 'info' });

    const token = localStorage.getItem('token');
    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => dataToSend.append(key, typeof formData[key] === 'object' ? JSON.stringify(formData[key]) : formData[key]));
    if (fotoArchivo) dataToSend.append('fotoPerfil', fotoArchivo);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/perfil`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: dataToSend });
      const data = await response.json();
      if (response.ok && data.success) {
        setMensaje({ texto: '¡Ficha creada! Redirigiendo al módulo de verificación...', tipo: 'success' });
        setTimeout(() => { 
          navigate('/documentos'); 
        }, 1500);
      } else { 
        setMensaje({ texto: data.message || 'Error al guardar.', tipo: 'error' }); 
      }
    } catch (err) { 
      console.error("Error al guardar perfil paso 1:", err); 
      setMensaje({ texto: 'Error de conexión.', tipo: 'error' }); 
    } finally { 
      setProcesando(false); 
    }
  };

  const comunasDisponibles = COMUNAS_RM.filter(c => !formData.zonaCobertura.includes(c));
  const comunasFiltradas = comunasDisponibles.filter(c => c.toLowerCase().includes(busquedaComuna.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#f5f1ea] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* --- STEPPER SIMPLIFICADO --- */}
        <div className="mb-10 flex items-center justify-center">
          <div className="flex items-center text-[#1b3b2c]">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg bg-[#1b3b2c] text-[#e8c582]">1</div>
            <span className="ml-3 font-extrabold text-lg hidden sm:block">Ficha Comercial</span>
          </div>
          <div className="w-16 sm:w-32 h-1 mx-4 rounded bg-gray-300"></div>
          <div className="flex items-center text-gray-400">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg bg-gray-200">2</div>
            <span className="ml-3 font-extrabold text-lg hidden sm:block">Verificación Legal</span>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl border border-gray-200">
          <Alert mensaje={mensaje} tipo={mensaje.tipo} />

          <div>
            <h2 className="text-3xl font-extrabold text-[#1b3b2c] mb-2 text-center">Configura tu Perfil Público</h2>
            <p className="text-gray-600 text-center mb-8">Esta información es la que verán los clientes al buscar tus servicios.</p>

            <form onSubmit={handleSubmitPaso1} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Nombre o Título de tu Tienda <span className="text-red-500">*</span></label>
                  <input type="text" name="tituloTienda" required value={formData.tituloTienda} onChange={handleChange} placeholder="Ej: Gasfitería Los Hermanos" className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-3 rounded-md outline-none focus:border-[#1b3b2c]" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Foto de Perfil (Opcional)</label>
                  <input type="file" accept="image/*" onChange={handleFotoChange} className="w-full bg-[#f5f1ea] border border-gray-300 px-3 py-2.5 rounded-md text-sm outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Sobre ti / Experiencia <span className="text-red-500">*</span></label>
                <textarea name="biografia" required rows="3" value={formData.biografia} onChange={handleChange} placeholder="Describe tus años de experiencia, especialidad y forma de trabajar..." className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-3 rounded-md outline-none focus:border-[#1b3b2c] resize-none"></textarea>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold mb-2 text-gray-700">Tarifa Referencia <span className="text-red-500">*</span></label>
                <input type="text" name="tarifaReferencia" required value={formData.tarifaReferencia} onChange={handleChange} placeholder="Ej: Visita técnica desde $15.000" className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-3 rounded-md outline-none focus:border-[#1b3b2c]" />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <label className="block text-base font-extrabold mb-4 text-[#1b3b2c]">¿Cómo atenderás a tus clientes?</label>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <button type="button" onClick={() => setFormData({...formData, tipoAtencion: 'A domicilio'})} className={`flex-1 py-3 px-4 rounded-md border text-sm font-bold transition-all ${formData.tipoAtencion === 'A domicilio' ? 'bg-[#1b3b2c] text-white border-[#1b3b2c] shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>🏠 Solo a Domicilio</button>
                  <button type="button" onClick={() => setFormData({...formData, tipoAtencion: 'En local'})} className={`flex-1 py-3 px-4 rounded-md border text-sm font-bold transition-all ${formData.tipoAtencion === 'En local' ? 'bg-[#1b3b2c] text-white border-[#1b3b2c] shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>📍 Solo en Local Físico</button>
                  <button type="button" onClick={() => setFormData({...formData, tipoAtencion: 'Ambas'})} className={`flex-1 py-3 px-4 rounded-md border text-sm font-bold transition-all ${formData.tipoAtencion === 'Ambas' ? 'bg-[#1b3b2c] text-white border-[#1b3b2c] shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>🔄 Ambas Modalidades</button>
                </div>
              </div>

              {(formData.tipoAtencion === 'A domicilio' || formData.tipoAtencion === 'Ambas') && (
                <div className="bg-[#f5f1ea] p-5 rounded-lg border border-gray-300 shadow-sm mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-extrabold text-[#1b3b2c]">Zonas de Cobertura (A Domicilio)</h4>
                    {formData.zonaCobertura.length > 0 && (
                      <button type="button" onClick={handleQuitarTodasLasComunas} className="text-xs text-red-600 font-bold hover:underline">Limpiar selección</button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4 max-h-40 overflow-y-auto pr-2 pb-2">
                    {formData.zonaCobertura.length === 0 && <span className="text-sm text-red-500 font-bold">* Selecciona comunas abajo</span>}
                    {formData.zonaCobertura.map(comuna => (
                      <span key={comuna} className="bg-[#1b3b2c] text-white text-xs px-3 py-1.5 rounded-full font-bold">{comuna} <button type="button" onClick={() => handleRemoverComuna(comuna)} className="ml-2 hover:text-red-400">✕</button></span>
                    ))}
                  </div>
                  
                  <div ref={dropdownZonaRef} className="relative mt-2">
                    <div onClick={() => setDropdownZonaAbierto(true)} className="w-full bg-white border border-gray-300 px-4 py-3 rounded-md text-sm outline-none focus-within:border-[#1b3b2c] cursor-text flex justify-between items-center transition-colors">
                      <input 
                        type="text" 
                        placeholder="Buscar y añadir comuna de cobertura..." 
                        value={busquedaComuna}
                        onChange={(e) => {
                          setBusquedaComuna(e.target.value);
                          setDropdownZonaAbierto(true);
                        }}
                        className="w-full outline-none text-gray-700 bg-transparent placeholder-gray-500 font-semibold"
                      />
                      <span className="text-gray-400 text-xs cursor-pointer" onClick={() => setDropdownZonaAbierto(!dropdownZonaAbierto)}>▼</span>
                    </div>

                    {dropdownZonaAbierto && (
                      <ul className="absolute z-50 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-2xl max-h-56 overflow-y-auto text-sm font-semibold">
                        {!busquedaComuna && comunasDisponibles.length > 0 && (
                          <li 
                            onClick={handleAgregarTodasLasComunas} 
                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-[#1b3b2c] font-extrabold border-b-2 border-gray-200 sticky top-0 bg-white"
                          >
                            + Seleccionar Todas las Comunas (Toda la RM)
                          </li>
                        )}
                        {comunasFiltradas.length === 0 ? (
                          <li className="px-4 py-3 text-gray-500 italic text-center">No se encontraron comunas</li>
                        ) : (
                          comunasFiltradas.map(c => (
                            <li key={c} onClick={() => handleAgregarComuna(c)} className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-gray-700 border-b border-gray-100 last:border-0">{c}</li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {(formData.tipoAtencion === 'En local' || formData.tipoAtencion === 'Ambas') && (
                <div ref={dropdownLocalesRef} className="bg-gray-50 p-5 rounded-lg border border-gray-300 shadow-sm mb-6">
                  <div className="flex justify-between items-center mb-4"><h4 className="font-extrabold text-[#1b3b2c]">Tus Locales Físicos</h4><button type="button" onClick={agregarLocal} className="text-xs font-bold bg-[#e8c582] text-[#1b3b2c] px-4 py-2 rounded shadow-sm">+ Añadir Local</button></div>
                  {formData.localesFisicos.length === 0 && <p className="text-sm text-red-500 font-bold mb-4">* Debes registrar al menos un local</p>}
                  <div className="space-y-6">
                    {formData.localesFisicos.map((local, index) => (
                      <div key={index} className="bg-white p-4 rounded-md border border-gray-200">
                        <div className="flex justify-between mb-3"><h5 className="font-bold text-sm text-gray-700">Local {index + 1}</h5><button type="button" onClick={() => removerLocal(index)} className="text-red-500 font-bold text-xs">✕ Eliminar</button></div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
                          <div className="md:col-span-3"><input type="text" placeholder="Nombre (Ej: Casa Matriz)" value={local.nombreLocal} onChange={(e) => handleLocalChange(index, 'nombreLocal', e.target.value)} className="w-full border px-3 py-2.5 rounded text-sm outline-none" required/></div>
                          
                          <div className="md:col-span-3 relative">
                            <div onClick={() => setDropdownLocalAbierto(dropdownLocalAbierto === index ? null : index)} className="w-full bg-white border border-gray-300 px-3 py-2.5 rounded text-sm outline-none hover:border-[#1b3b2c] cursor-pointer flex justify-between items-center transition-colors">
                              <span className={local.comuna ? "text-gray-800" : "text-gray-400"}>{local.comuna || 'Comuna'}</span>
                              <span className="text-gray-400 text-[10px]">▼</span>
                            </div>
                            {dropdownLocalAbierto === index && (
                              <ul className="absolute z-50 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-2xl max-h-48 overflow-y-auto text-sm font-semibold">
                                {COMUNAS_RM.map(c => (
                                  <li key={c} onClick={() => { handleLocalChange(index, 'comuna', c); setDropdownLocalAbierto(null); }} className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-gray-700">{c}</li>
                                ))}
                              </ul>
                            )}
                          </div>

                          <div className="md:col-span-4"><input type="text" placeholder="Calle" required value={local.direccion} onChange={(e) => handleLocalChange(index, 'direccion', e.target.value)} className="w-full border px-3 py-2.5 rounded text-sm outline-none" /></div>
                          <div className="md:col-span-2"><input type="text" placeholder="N°" required value={local.numero} onChange={(e) => handleLocalChange(index, 'numero', e.target.value)} className="w-full border px-3 py-2.5 rounded text-sm outline-none" /></div>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-xs text-gray-500 font-bold">1. Escribe la dirección 2. Haz clic en "Ubicar"</p>
                          <button type="button" onClick={() => buscarDireccionEnMapa(index)} disabled={buscandoMapa} className="bg-[#1b3b2c] text-[#e8c582] px-4 py-2 rounded text-xs font-bold shadow-sm">📍 {buscandoMapa ? 'Buscando...' : 'Ubicar en Mapa'}</button>
                        </div>
                        <div className="h-64 w-full rounded border border-gray-300 overflow-hidden relative z-0">
                          <div className="absolute top-2 left-2 z-[1000] bg-white px-3 py-1 text-xs font-bold rounded shadow border">📍 Arrastra el pin para mayor precisión</div>
                          <MapContainer center={[local.lat, local.lng]} zoom={15} style={{ width: '100%', height: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                            <MapUpdater center={[local.lat, local.lng]} animate={true} />
                            <MapPicker setCoords={(lat, lng) => handleMapCoords(index, lat, lng)} />
                            <Marker draggable={true} eventHandlers={{ dragend: (e) => handleMapCoords(index, e.target.getLatLng().lat, e.target.getLatLng().lng) }} position={[local.lat, local.lng]} />
                          </MapContainer>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <button type="submit" disabled={procesando} className="w-full bg-[#1b3b2c] hover:bg-opacity-90 text-[#e8c582] font-extrabold text-lg py-4 rounded-md transition-all mt-6 shadow-md">
                {procesando ? 'Guardando ficha...' : 'Paso Siguiente: Documentación Legal →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;