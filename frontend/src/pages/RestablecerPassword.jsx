import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Alert from '../components/Alert';

const RestablecerPassword = () => {
  const [passwords, setPasswords] = useState({ nueva: '', confirmar: '' });
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [procesando, setProcesando] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Medida de seguridad: Si alguien entra a esta URL directo sin venir del correo simulado, lo sacamos.
  useEffect(() => {
    if (!email) navigate('/login');
  }, [email, navigate]);

  const handleChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.nueva !== passwords.confirmar) {
      return setMensaje({ texto: 'Las contraseñas no coinciden.', tipo: 'error' });
    }
    if (passwords.nueva.length < 6) {
      return setMensaje({ texto: 'La contraseña debe tener al menos 6 caracteres.', tipo: 'error' });
    }

    setProcesando(true);
    setMensaje({ texto: 'Actualizando contraseña...', tipo: 'info' });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/restablecer-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email, nuevaPassword: passwords.nueva })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMensaje({ texto: '¡Contraseña actualizada con éxito! Redirigiendo...', tipo: 'success' });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMensaje({ texto: data.message || 'Error al actualizar.', tipo: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' });
    } finally {
      setProcesando(false);
    }
  };

  if (!email) return null; // Previene renderizado visual antes del redirect de seguridad

  return (
    <div className="flex justify-center items-center py-12 px-6 bg-[#f5f1ea] min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-extrabold text-[#1b3b2c] mb-2 text-center">Crea una nueva contraseña</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">Estás restableciendo el acceso para:<br/><strong className="text-[#1b3b2c]">{email}</strong></p>
        
        <Alert mensaje={mensaje} tipo={mensaje.tipo} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Nueva Contraseña</label>
            <input type="password" name="nueva" required onChange={handleChange} className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-3 rounded-md outline-none focus:border-[#1b3b2c]"/>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Confirmar Nueva Contraseña</label>
            <input type="password" name="confirmar" required onChange={handleChange} className="w-full bg-[#f5f1ea] border border-gray-300 px-4 py-3 rounded-md outline-none focus:border-[#1b3b2c]"/>
          </div>
          <button type="submit" disabled={procesando} className="w-full bg-[#1b3b2c] hover:bg-opacity-90 text-[#e8c582] font-bold py-3 rounded-md transition-all mt-4 shadow-md">
            {procesando ? 'Guardando...' : 'Guardar nueva contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RestablecerPassword;