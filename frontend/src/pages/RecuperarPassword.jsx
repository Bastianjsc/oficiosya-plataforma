import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Alert from '../components/Alert';

const RecuperarPassword = () => {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [procesando, setProcesando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcesando(true);
    setMensaje({ texto: 'Buscando cuenta...', tipo: 'info' });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/recuperar-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMensaje({ texto: 'Cuenta encontrada. Preparando entorno...', tipo: 'success' });
        setTimeout(() => {
          navigate('/verificar-correo', { state: { motivo: 'recuperacion', email } });
        }, 1000);
      } else {
        setMensaje({ texto: data.message || 'Error al buscar el correo.', tipo: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' });
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-6 bg-[#f5f1ea] min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-extrabold text-[#1b3b2c] mb-2 text-center">Recuperar Contraseña</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">Ingresa el correo electrónico asociado a tu cuenta y te enviaremos las instrucciones.</p>
        
        <Alert mensaje={mensaje} tipo={mensaje.tipo} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Correo Electrónico</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-3 rounded-md outline-none focus:border-[#1b3b2c]"
              placeholder="tu@correo.com"
            />
          </div>
          <button type="submit" disabled={procesando} className="w-full bg-[#1b3b2c] hover:bg-opacity-90 text-[#e8c582] font-bold py-3 rounded-md transition-all mt-4 shadow-md">
            {procesando ? 'Buscando...' : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-[#1b3b2c] transition-colors">← Volver al inicio de sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default RecuperarPassword;