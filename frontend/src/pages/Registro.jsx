import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';

const Registro = () => {
  const [listaOficios, setListaOficios] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '', email: '', password: '', rol: 'Cliente', oficio: ''
  });
  
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const navigate = useNavigate();

  // Custom Dropdowns
  const [dropdownRolAbierto, setDropdownRolAbierto] = useState(false);
  const [dropdownOficioAbierto, setDropdownOficioAbierto] = useState(false);
  const dropdownRolRef = useRef(null);
  const dropdownOficioRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRolRef.current && !dropdownRolRef.current.contains(event.target)) setDropdownRolAbierto(false);
      if (dropdownOficioRef.current && !dropdownOficioRef.current.contains(event.target)) setDropdownOficioAbierto(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/auth/oficios`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.oficios.length > 0) {
          setListaOficios(data.oficios);
          setFormData(prev => ({ ...prev, oficio: data.oficios[0] }));
        }
      })
      .catch(err => console.log('Error cargando oficios', err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCustomDropdown = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  // --- MODIFICACIÓN DE SPRINT 4: SIMULACIÓN DE FLUJO DE CORREO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: 'Registrando cuenta...', tipo: 'info' });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Guardamos las credenciales temporales
        localStorage.setItem('token', data.token);
        localStorage.setItem('nombreUsuario', formData.nombre);
        
        // Redirigimos a la nueva pantalla visual de "Verifica tu correo"
        setMensaje({ texto: '¡Registro exitoso! Preparando entorno...', tipo: 'success' });
        
        setTimeout(() => {
          navigate('/verificar-correo', { 
            state: { 
              motivo: 'registro', 
              email: formData.email,
              rol: formData.rol 
            } 
          });
        }, 1000);

      } else { 
        setMensaje({ texto: data.message || 'Error al registrar.', tipo: 'error' }); 
      }
    } catch (error) { 
      console.error(error); 
      setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' }); 
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-6 bg-[#f5f1ea] min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-extrabold text-[#1b3b2c] mb-6 text-center">Registro en OficiosYa</h2>
        
        <Alert mensaje={mensaje} tipo={mensaje.tipo} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-gray-700 font-semibold mb-1">Nombre Completo</label><input type="text" name="nombre" required onChange={handleChange} className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-2 rounded-md outline-none focus:border-[#1b3b2c] transition-colors"/></div>
          <div><label className="block text-gray-700 font-semibold mb-1">Correo Electrónico</label><input type="email" name="email" required onChange={handleChange} className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-2 rounded-md outline-none focus:border-[#1b3b2c] transition-colors"/></div>
          <div><label className="block text-gray-700 font-semibold mb-1">Contraseña</label><input type="password" name="password" required onChange={handleChange} className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-2 rounded-md outline-none focus:border-[#1b3b2c] transition-colors"/></div>

          <div ref={dropdownRolRef} className="relative">
            <label className="block text-gray-700 font-semibold mb-1">Tipo de Usuario</label>
            <div onClick={() => setDropdownRolAbierto(!dropdownRolAbierto)} className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-2.5 rounded-md text-sm font-semibold cursor-pointer flex justify-between items-center hover:border-[#1b3b2c] transition-colors">
              <span className="text-[#1b3b2c]">{formData.rol === 'Cliente' ? 'Cliente (Busco servicios)' : 'Prestador (Ofrezco servicios)'}</span>
              <span className="text-gray-400 text-[10px]">▼</span>
            </div>
            {dropdownRolAbierto && (
              <ul className="absolute z-50 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-2xl max-h-48 overflow-y-auto text-sm font-semibold">
                <li onClick={() => { handleCustomDropdown('rol', 'Cliente'); setDropdownRolAbierto(false); }} className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-gray-700">Cliente (Busco servicios)</li>
                <li onClick={() => { handleCustomDropdown('rol', 'Prestador'); setDropdownRolAbierto(false); }} className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-gray-700">Prestador (Ofrezco servicios)</li>
              </ul>
            )}
          </div>

          {formData.rol === 'Prestador' && (
            <div ref={dropdownOficioRef} className="relative">
              <label className="block text-gray-700 font-semibold mb-1">Selecciona tu Oficio Principal</label>
              <div onClick={() => setDropdownOficioAbierto(!dropdownOficioAbierto)} className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-2.5 rounded-md text-sm font-semibold cursor-pointer flex justify-between items-center hover:border-[#1b3b2c] transition-colors">
                <span className={formData.oficio === '' ? 'text-gray-700' : 'text-[#1b3b2c]'}>{formData.oficio || 'Seleccionar oficio...'}</span>
                <span className="text-gray-400 text-[10px]">▼</span>
              </div>
              {dropdownOficioAbierto && (
                <ul className="absolute z-50 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-2xl max-h-48 overflow-y-auto text-sm font-semibold">
                  {listaOficios.map((oficioItem, index) => (
                    <li key={index} onClick={() => { handleCustomDropdown('oficio', oficioItem); setDropdownOficioAbierto(false); }} className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-gray-700">{oficioItem}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button type="submit" className="w-full bg-[#1b3b2c] hover:bg-opacity-90 text-white font-bold py-3 rounded-md transition-all mt-6 shadow-md">
            Siguiente paso
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registro;