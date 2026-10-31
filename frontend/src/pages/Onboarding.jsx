import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMUNAS_RM } from '../data/comunas';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { MapUpdater, MapPicker } from '../components/MapHelpers';
import Alert from '../components/Alert';
import InsigniaVerificada from '../components/InsigniaVerificada'; // <-- NUEVA IMPORTACIÓN

const Onboarding = () => {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  
  const [formData, setFormData] = useState({ tituloTienda: '', biografia: '', tarifaReferencia: '', zonaCobertura: [], tipoAtencion: 'A domicilio', localesFisicos: [] });
  const [fotoArchivo, setFotoArchivo] = useState(null);
  const [buscandoMapa, setBuscandoMapa] = useState(false);
  
  const [archivosLegales, setArchivosLegales] = useState({ cedula: [], antecedentes: [] });

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
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/auth/perfil', { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: dataToSend });
      const data = await response.json();
      if (response.ok && data.success) {
        setMensaje({ texto: '¡Ficha creada! Pasemos a la verificación.', tipo: 'success' }); // <-- TEXTO ACTUALIZADO
        setTimeout(() => { setPaso(2); setMensaje({ texto: '', tipo: '' }); }, 1500);
      } else { setMensaje({ texto: data.message || 'Error al guardar.', tipo: 'error' }); }
    } catch (err) { console.error("Error al guardar perfil paso 1:", err); setMensaje({ texto: 'Error de conexión.', tipo: 'error' }); } finally { setProcesando(false); }
  };

  const handleLegalChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const nuevosArchivos = Array.from(files);
      setArchivosLegales(prev => ({
        ...prev,
        [name]: [...prev[name], ...nuevosArchivos]
      }));
    }
    e.target.value = null; 
  };

  const removerArchivoLegal = (tipo, index) => {
    setArchivosLegales(prev => {
      const listaActualizada = [...prev[tipo]];
      listaActualizada.splice(index, 1);
      return { ...prev, [tipo]: listaActualizada };
    });
  };

  const handleSubmitPaso2 = async (e) => {
    e.preventDefault();
    
    if (archivosLegales.cedula.length === 0) {
      return setMensaje({ texto: 'Debes adjuntar al menos un archivo para tu Cédula de Identidad.', tipo: 'error' });
    }
    if (archivosLegales.antecedentes.length === 0) {
      return setMensaje({ texto: 'Debes adjuntar al menos un archivo de Acreditación Profesional.', tipo: 'error' });
    }

    setProcesando(true);
    setMensaje({ texto: 'Subiendo documentos de seguridad...', tipo: 'info' });

    const token = localStorage.getItem('token');
    const formDocs = new FormData();
    
    archivosLegales.cedula.forEach(file => formDocs.append('cedula', file));
    archivosLegales.antecedentes.forEach(file => formDocs.append('antecedentes', file));

    try {
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/auth/verify-upload', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formDocs });
      const data = await response.json();
      if (response.ok && data.success) {
        setMensaje({ texto: '¡Proceso completado! Bienvenido a tu panel de control.', tipo: 'success' });
        setTimeout(() => navigate('/prestador'), 2000);
      } else { setMensaje({ texto: data.message || 'Error al subir los documentos.', tipo: 'error' }); }
    } catch (error) { console.error("Error al subir documentos paso 2:", error); setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' }); } finally { setProcesando(false); }
  };

  const comunasDisponibles = COMUNAS_RM.filter(c => !formData.zonaCobertura.includes(c));
  const comunasFiltradas = comunasDisponibles.filter(c => c.toLowerCase().includes(busquedaComuna.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#f5f1ea] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* --- STEPPER ACTUALIZADO --- */}
        <div className="mb-10 flex items-center justify-center">
          <div className={`flex items-center ${paso >= 1 ? 'text-[#1b3b2c]' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${paso >= 1 ? 'bg-[#1b3b2c] text-[#e8c582]' : 'bg-gray-200'}`}>1</div>
            <span className="ml-3 font-extrabold text-lg hidden sm:block">Ficha Comercial</span>
          </div>
          <div className={`w-16 sm:w-32 h-1 mx-4 rounded ${paso === 2 ? 'bg-[#1b3b2c]' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${paso === 2 ? 'text-[#1b3b2c]' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${paso === 2 ? 'bg-[#1b3b2c] text-[#e8c582]' : 'bg-gray-200'}`}>2</div>
            <span className="ml-3 font-extrabold text-lg hidden sm:block">Verificación de Cuenta</span> {/* <-- TEXTO ACTUALIZADO */}
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl border border-gray-200">
          <Alert mensaje={mensaje} tipo={mensaje.tipo} />

          {paso === 1 && (
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
          )}

          {paso === 2 && (
            <div>
              {/* --- TÍTULO ACTUALIZADO CON LA INSIGNIA --- */}
              <h2 className="text-3xl font-extrabold text-[#1b3b2c] mb-4 flex items-center justify-center gap-2">
                Auditoría y Verificación <InsigniaVerificada className="w-8 h-8 -mt-1" />
              </h2>
              <p className="text-lg text-gray-600 text-center mb-8">
                Tu perfil está guardado. Para garantizar la seguridad de nuestra comunidad y otorgarte la <strong className="text-[#1b3b2c]">insignia de perfil verificado</strong>, necesitamos validar tu identidad y certificaciones.
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 text-left rounded-r-md">
                <div className="flex items-start">
                  <span className="text-blue-500 text-xl mr-3 mt-0.5">ℹ️</span>
                  <div>
                    <h3 className="text-sm font-bold text-blue-800">Ley N° 19.628 de Protección de Datos Personales</h3>
                    <p className="mt-1 text-sm text-blue-700 font-medium">
                      Tus documentos serán cifrados y almacenados de forma segura en servidores AWS/GCP, con acceso exclusivo para el equipo de auditoría. <strong>No serán públicos.</strong>
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitPaso2} className="space-y-8">
                
                <div className="bg-[#f5f1ea] p-6 rounded-lg border border-gray-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-red-100 text-red-800 text-[10px] font-extrabold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Obligatorio</div>
                  
                  <label className="block text-lg text-[#1b3b2c] font-extrabold mb-2">1. Cédula de Identidad Nacional (RUT)</label>
                  
                  <div className="text-sm text-gray-600 mb-4 bg-white p-4 rounded border border-gray-200 shadow-sm">
                    <p className="font-semibold mb-2">Por tu seguridad financiera e informática, antes de subir la imagen <strong className="text-red-600">DEBES TACHAR O CENSURAR</strong> el "Número de Documento".</p>
                    <ul className="list-disc pl-5 space-y-1 text-xs font-medium">
                      <li>Cédulas nuevas (Celestes): Tacha el número debajo de la fecha de nacimiento.</li>
                      <li>Cédulas antiguas (Amarillas): Tacha el número en el reverso del carnet.</li>
                    </ul>
                    <p className="mt-2 text-xs italic text-gray-500">Solo necesitamos ver tu nombre, RUT, foto y vigencia. Puedes adjuntar múltiples imágenes o PDFs si lo requieres.</p>
                  </div>
                  
                  <input type="file" name="cedula" multiple onChange={handleLegalChange} accept=".jpg,.jpeg,.png,.pdf" className="w-full bg-white text-gray-700 file:mr-4 file:py-2.5 file:px-6 file:rounded-md file:border-0 file:font-bold file:bg-[#1b3b2c] file:text-white hover:file:bg-opacity-90 border border-gray-200 rounded-md shadow-sm" />
                  
                  {archivosLegales.cedula.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-bold text-gray-600 uppercase">Archivos Seleccionados:</p>
                      {archivosLegales.cedula.map((file, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 text-sm shadow-sm">
                          <span className="truncate max-w-[200px] sm:max-w-xs font-medium text-gray-700">📄 {file.name}</span>
                          <button type="button" onClick={() => removerArchivoLegal('cedula', idx)} className="text-red-500 hover:text-red-700 font-bold px-3 py-1 rounded bg-red-50 border border-red-100 hover:bg-red-100 transition-colors">✕ Quitar</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-[#f5f1ea] p-6 rounded-lg border border-gray-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-red-100 text-red-800 text-[10px] font-extrabold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Obligatorio</div>

                  <label className="block text-lg text-[#1b3b2c] font-extrabold mb-2">2. Acreditación Profesional y Legal</label>
                  
                  <div className="text-sm text-gray-600 mb-4 bg-white p-4 rounded border border-gray-200 shadow-sm">
                    <p className="font-semibold mb-2">Sube los documentos que respalden tu idoneidad y seguridad para trabajar con clientes.</p>
                    <p className="text-xs font-bold text-[#1b3b2c] mb-1">¿Qué debo incluir aquí?</p>
                    <ul className="list-disc pl-5 space-y-1 text-xs font-medium mb-3">
                      <li><strong className="text-gray-700">Certificaciones Técnicas:</strong> Título profesional, licencias SEC (Superintendencia de Electricidad y Combustibles) si eres electricista o gásfiter, o diplomas.</li>
                      <li><strong className="text-gray-700">Certificado de Antecedentes (Fines Especiales):</strong> Máximo 30 días de antigüedad.</li>
                      <li><strong className="text-gray-700">Certificado de Inhabilidades para trabajar con menores:</strong> Obligatorio si tu servicio implica contacto directo con niños (Ley N° 20.594).</li>
                    </ul>
                  </div>

                  <input type="file" name="antecedentes" multiple onChange={handleLegalChange} accept=".jpg,.jpeg,.png,.pdf" className="w-full bg-white text-gray-700 file:mr-4 file:py-2.5 file:px-6 file:rounded-md file:border-0 file:font-bold file:bg-[#1b3b2c] file:text-white hover:file:bg-opacity-90 border border-gray-200 rounded-md shadow-sm" />
                  
                  {archivosLegales.antecedentes.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-bold text-gray-600 uppercase">Archivos Seleccionados:</p>
                      {archivosLegales.antecedentes.map((file, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 text-sm shadow-sm">
                          <span className="truncate max-w-[200px] sm:max-w-xs font-medium text-gray-700">📄 {file.name}</span>
                          <button type="button" onClick={() => removerArchivoLegal('antecedentes', idx)} className="text-red-500 hover:text-red-700 font-bold px-3 py-1 rounded bg-red-50 border border-red-100 hover:bg-red-100 transition-colors">✕ Quitar</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-300">
                  <button type="button" onClick={() => setPaso(1)} disabled={procesando} className="w-full sm:w-1/3 bg-white hover:bg-gray-100 text-gray-700 font-bold py-4 rounded-md transition-all shadow-sm border border-gray-300">← Volver a Ficha Comercial</button>
                  <button type="submit" disabled={procesando} className="w-full sm:w-2/3 bg-[#1b3b2c] hover:bg-opacity-90 text-[#e8c582] font-extrabold text-lg py-4 rounded-md transition-all shadow-md">{procesando ? 'Enviando a Auditoría...' : 'Enviar Documentos y Entrar ✓'}</button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Onboarding;