import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Alert from '../components/Alert';

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        
        if (data.nombre) {
          localStorage.setItem('nombreUsuario', data.nombre);
        } else {
          localStorage.setItem('nombreUsuario', 'Mi Cuenta');
        }

        const payloadToken = JSON.parse(atob(data.token.split('.')[1]));
        const rolUsuario = payloadToken.rol;

        setMensaje({ texto: '¡Bienvenido! Redirigiendo a tu panel...', tipo: 'success' });

        setTimeout(() => {
          if (rolUsuario === 'Cliente') navigate('/cliente');
          else if (rolUsuario === 'Prestador') navigate('/prestador');
          else if (rolUsuario === 'Admin') navigate('/admin');
          else navigate('/');
        }, 1000);

      } else {
        setMensaje({ texto: data.message || 'Credenciales inválidas.', tipo: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' });
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-6 bg-[#f5f1ea] min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-extrabold text-[#1b3b2c] mb-6 text-center">
          Iniciar Sesión en OficiosYa
        </h2>
        
        <Alert mensaje={mensaje} tipo={mensaje.tipo} />

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {/* ENLACE NUEVO: Recuperar Contraseña */}
            <div className="text-right mt-2">
              <Link to="/recuperar-password" className="text-xs font-bold text-gray-500 hover:text-[#1b3b2c] underline transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#1b3b2c] hover:bg-opacity-90 text-white font-bold py-3 rounded-md transition-all mt-6 shadow-md"
          >
            Entrar a la plataforma
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;