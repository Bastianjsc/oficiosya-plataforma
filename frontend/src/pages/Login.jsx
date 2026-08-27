import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: 'Iniciando sesión...', tipo: 'info' });

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Guardar el Token criptográfico en el almacenamiento del navegador
        localStorage.setItem('token', data.token);
        // Guardar los datos básicos del usuario
        localStorage.setItem('usuario', JSON.stringify(data.data));
        
        setMensaje({ texto: '¡Bienvenido!', tipo: 'success' });
        
        // Redirigir al inicio después de 1 segundo
        setTimeout(() => navigate('/'), 1000);
      } else {
        setMensaje({ texto: data.message || 'Credenciales inválidas.', tipo: 'error' });
      }
    } catch (error) {
      setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' });
    }
  };

  return (
    <div className="flex justify-center items-center py-16 px-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-extrabold text-[#1b3b2c] mb-2 text-center">
          Iniciar Sesión
        </h2>
        <p className="text-gray-500 text-center mb-6">Ingresa a tu cuenta de OficiosYa</p>
        
        {mensaje.texto && (
          <div className={`p-3 mb-4 rounded-md text-sm font-medium ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              name="email" 
              required 
              onChange={handleChange}
              className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-3 rounded-md outline-none focus:border-[#1b3b2c] transition-colors"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Contraseña</label>
            <input 
              type="password" 
              name="password" 
              required 
              onChange={handleChange}
              className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-3 rounded-md outline-none focus:border-[#1b3b2c] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#1b3b2c] hover:bg-opacity-90 text-white font-bold py-3 rounded-md transition-all mt-4"
          >
            Ingresar
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600 text-sm">
          ¿No tienes una cuenta?{' '}
          <Link to="/registro" className="text-[#1b3b2c] font-bold hover:underline">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;