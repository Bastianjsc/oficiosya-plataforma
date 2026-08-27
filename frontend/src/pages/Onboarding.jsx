import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const [archivos, setArchivos] = useState({ cedula: null, antecedentes: null });
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setArchivos({ ...archivos, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: 'Subiendo documentos...', tipo: 'info' });

    // Recuperar el token del almacenamiento local
    const token = localStorage.getItem('token');

    if (!token) {
      setMensaje({ texto: 'Error: Debes iniciar sesión primero.', tipo: 'error' });
      return;
    }

    // Usar FormData para enviar archivos binarios
    const formData = new FormData();
    formData.append('cedula', archivos.cedula);
    formData.append('antecedentes', archivos.antecedentes);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` // <--- Aquí usamos la llave criptográfica
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMensaje({ texto: '¡Documentos enviados con éxito! Un administrador validará tu perfil pronto.', tipo: 'success' });
        setTimeout(() => navigate('/'), 3000);
      } else {
        setMensaje({ texto: data.message || 'Error al subir los documentos.', tipo: 'error' });
      }
    } catch (error) {
      setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f1ea] flex justify-center items-center py-12 px-6">
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl w-full max-w-2xl border border-gray-200">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1b3b2c] mb-4 text-center">
          Obtén tu Sello de Confianza
        </h2>
        <p className="text-lg text-gray-600 text-center mb-8">
          Para garantizar la seguridad de nuestra comunidad, necesitamos validar tu identidad. 
          Sube una foto clara de los siguientes documentos.
        </p>

        {mensaje.texto && (
          <div className={`p-4 mb-6 rounded-md text-base font-bold ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cédula de Identidad */}
          <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
            <label className="block text-xl text-gray-800 font-bold mb-2">1. Cédula de Identidad</label>
            <p className="text-gray-500 mb-4">Foto por ambos lados o en formato PDF.</p>
            <input 
              type="file" 
              name="cedula" 
              required 
              onChange={handleFileChange}
              className="w-full text-lg text-gray-700 file:mr-4 file:py-3 file:px-6 file:rounded-md file:border-0 file:text-base file:font-bold file:bg-[#1b3b2c] file:text-white hover:file:bg-opacity-90"
            />
          </div>

          {/* Certificado de Antecedentes */}
          <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
            <label className="block text-xl text-gray-800 font-bold mb-2">2. Certificado de Antecedentes</label>
            <p className="text-gray-500 mb-4">Documento actualizado (máximo 30 días de antigüedad).</p>
            <input 
              type="file" 
              name="antecedentes" 
              required 
              onChange={handleFileChange}
              className="w-full text-lg text-gray-700 file:mr-4 file:py-3 file:px-6 file:rounded-md file:border-0 file:text-base file:font-bold file:bg-[#1b3b2c] file:text-white hover:file:bg-opacity-90"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#1b3b2c] hover:bg-opacity-90 text-white font-extrabold text-lg py-4 rounded-md transition-all mt-6 shadow-md"
          >
            Enviar documentos para revisión
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;