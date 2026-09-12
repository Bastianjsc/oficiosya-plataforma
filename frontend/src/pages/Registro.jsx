import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Registro = () => {
  const [listaOficios, setListaOficios] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'Cliente',
    oficio: ''
  });
  
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const navigate = useNavigate();

  // Cargar los oficios desde la ruta pública del backend de forma dinámica
  useEffect(() => {
    fetch('http://localhost:5000/api/auth/oficios')
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: 'Registrando cuenta...', tipo: 'info' });

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('nombreUsuario', formData.nombre);
        
        if (formData.rol === 'Prestador') {
          setMensaje({ texto: '¡Registro exitoso! Redirigiendo a carga de documentos...', tipo: 'success' });
          setTimeout(() => navigate('/onboarding'), 1500);
        } else {
          setMensaje({ texto: '¡Registro exitoso! Redirigiendo a tu panel...', tipo: 'success' });
          setTimeout(() => navigate('/cliente'), 1500);
        }
      } else {
        setMensaje({ texto: data.message || 'Error al registrar.', tipo: 'error' });
      }
    } catch (error) {
      setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' });
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-6 bg-[#f5f1ea] min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-extrabold text-[#1b3b2c] mb-6 text-center">
          Registro en OficiosYa
        </h2>
        
        {mensaje.texto && (
          <div className={`p-3 mb-4 rounded-md text-sm font-medium ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Nombre Completo</label>
            <input 
              type="text" 
              name="nombre" 
              required 
              onChange={handleChange}
              className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-2 rounded-md outline-none focus:border-[#1b3b2c]"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              name="email" 
              required 
              onChange={handleChange}
              className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-2 rounded-md outline-none focus:border-[#1b3b2c]"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Contraseña</label>
            <input 
              type="password" 
              name="password" 
              required 
              onChange={handleChange}
              className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-2 rounded-md outline-none focus:border-[#1b3b2c]"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Tipo de Usuario</label>
            <select 
              name="rol" 
              onChange={handleChange}
              className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-2 rounded-md outline-none focus:border-[#1b3b2c]"
            >
              <option value="Cliente">Cliente (Busco servicios)</option>
              <option value="Prestador">Prestador (Ofrezco servicios)</option>
            </select>
          </div>

          {formData.rol === 'Prestador' && (
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Selecciona tu Oficio Principal</label>
              <select 
                name="oficio" 
                value={formData.oficio} 
                onChange={handleChange}
                className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-2 rounded-md outline-none focus:border-[#1b3b2c]"
              >
                {listaOficios.map((oficioItem, index) => (
                  <option key={index} value={oficioItem}>{oficioItem}</option>
                ))}
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-[#1b3b2c] hover:bg-opacity-90 text-white font-bold py-3 rounded-md transition-all mt-6"
          >
            Siguiente paso
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registro;