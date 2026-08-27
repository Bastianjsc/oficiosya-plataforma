import { useState } from 'react';

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'Cliente',
    oficio: '' // Solo se usa si es prestador
  });
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: 'Procesando...', tipo: 'info' });

    try {
      // Conexión con tu API REST local
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMensaje({ texto: '¡Registro exitoso! Tu perfil ha sido creado.', tipo: 'success' });
        // Aquí luego redirigiremos al Login
      } else {
        setMensaje({ texto: data.message || 'Error al registrar.', tipo: 'error' });
      }
    } catch (error) {
      setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' });
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-extrabold text-[#1b3b2c] mb-6 text-center">
          Únete a OficiosYa
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
            <label className="block text-gray-700 font-semibold mb-1">¿Cómo usarás la plataforma?</label>
            <select 
              name="rol" 
              onChange={handleChange}
              className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-2 rounded-md outline-none focus:border-[#1b3b2c]"
            >
              <option value="Cliente">Busco contratar servicios (Cliente)</option>
              <option value="Prestador">Quiero ofrecer mis servicios (Prestador)</option>
            </select>
          </div>

          {/* Campo condicional: Solo aparece si el rol es 'Prestador' */}
          {formData.rol === 'Prestador' && (
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Tu Oficio Principal</label>
              <input 
                type="text" 
                name="oficio" 
                placeholder="Ej: Gasfitería, Electricidad..." 
                required 
                onChange={handleChange}
                className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-2 rounded-md outline-none focus:border-[#1b3b2c]"
              />
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-[#1b3b2c] hover:bg-opacity-90 text-white font-bold py-3 rounded-md transition-all mt-6"
          >
            Crear cuenta
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registro;