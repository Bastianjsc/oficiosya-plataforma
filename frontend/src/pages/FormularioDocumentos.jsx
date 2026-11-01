import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Alert from '../components/Alert';
import InsigniaVerificada from '../components/InsigniaVerificada';

const FormularioDocumentos = () => {
  const navigate = useNavigate();
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [archivosLegales, setArchivosLegales] = useState({ cedula: [], antecedentes: [] });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

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

  const handleSubmitDocs = async (e) => {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-upload`, { 
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${token}` }, 
        body: formDocs 
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMensaje({ texto: '¡Documentos enviados a auditoría exitosamente!', tipo: 'success' });
        setTimeout(() => navigate('/prestador'), 2000);
      } else { 
        setMensaje({ texto: data.message || 'Error al subir los documentos.', tipo: 'error' }); 
      }
    } catch (error) { 
      console.error("Error al subir documentos:", error); 
      setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' }); 
    } finally { 
      setProcesando(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f1ea] py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white p-8 md:p-12 rounded-lg shadow-xl border border-gray-200">
        
        <div className="mb-6 flex justify-between items-center border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-extrabold text-[#1b3b2c] flex items-center gap-2">
            Auditoría de Documentos <InsigniaVerificada className="w-6 h-6 -mt-1" />
          </h2>
          <Link to="/prestador" className="text-sm font-bold text-gray-500 hover:text-[#1b3b2c] underline">
            ← Volver al Panel
          </Link>
        </div>

        <Alert mensaje={mensaje} tipo={mensaje.tipo} />

        <p className="text-sm text-gray-600 mb-8 font-medium">
          Para garantizar la seguridad de nuestra comunidad, necesitamos validar tu identidad y certificaciones.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 text-left rounded-r-md">
          <div className="flex items-start">
            <span className="text-blue-500 text-xl mr-3 mt-0.5">ℹ️</span>
            <div>
              <h3 className="text-sm font-bold text-blue-800">Ley N° 19.628 de Protección de Datos</h3>
              <p className="mt-1 text-sm text-blue-700 font-medium">
                Tus documentos serán cifrados y almacenados de forma segura con acceso exclusivo para el equipo de auditoría. <strong>No serán públicos.</strong>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmitDocs} className="space-y-8">
          
          {/* Cédula */}
          <div className="bg-[#f5f1ea] p-6 rounded-lg border border-gray-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-100 text-red-800 text-[10px] font-extrabold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Obligatorio</div>
            
            <label className="block text-lg text-[#1b3b2c] font-extrabold mb-2">1. Cédula de Identidad (RUT)</label>
            
            <div className="text-sm text-gray-600 mb-4 bg-white p-4 rounded border border-gray-200 shadow-sm">
              <p className="font-semibold mb-2">Por tu seguridad financiera, <strong className="text-red-600">DEBES TACHAR O CENSURAR</strong> el "Número de Documento" antes de subir la imagen.</p>
              <ul className="list-disc pl-5 space-y-1 text-xs font-medium">
                <li>Cédulas nuevas (Celestes): Tacha el número debajo de la fecha de nacimiento.</li>
                <li>Cédulas antiguas (Amarillas): Tacha el número en el reverso.</li>
              </ul>
            </div>
            
            <input type="file" name="cedula" multiple onChange={handleLegalChange} accept=".jpg,.jpeg,.png,.pdf" className="w-full bg-white text-gray-700 file:mr-4 file:py-2.5 file:px-6 file:rounded-md file:border-0 file:font-bold file:bg-[#1b3b2c] file:text-white hover:file:bg-opacity-90 border border-gray-200 rounded-md shadow-sm" />
            
            {archivosLegales.cedula.length > 0 && (
              <div className="mt-4 space-y-2">
                {archivosLegales.cedula.map((file, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 text-sm shadow-sm">
                    <span className="truncate max-w-[200px] font-medium text-gray-700">📄 {file.name}</span>
                    <button type="button" onClick={() => removerArchivoLegal('cedula', idx)} className="text-red-500 hover:text-red-700 font-bold px-3 py-1 rounded bg-red-50 border border-red-100 hover:bg-red-100 transition-colors">✕ Quitar</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Antecedentes y Certificados */}
          <div className="bg-[#f5f1ea] p-6 rounded-lg border border-gray-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-100 text-red-800 text-[10px] font-extrabold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Obligatorio</div>

            <label className="block text-lg text-[#1b3b2c] font-extrabold mb-2">2. Acreditación Profesional</label>
            
            <div className="text-sm text-gray-600 mb-4 bg-white p-4 rounded border border-gray-200 shadow-sm">
              <p className="font-semibold mb-2">Sube los documentos que respalden tu idoneidad técnica o legal.</p>
              <ul className="list-disc pl-5 space-y-1 text-xs font-medium">
                <li><strong className="text-gray-700">Certificaciones Técnicas:</strong> Título, licencias SEC, diplomas.</li>
                <li><strong className="text-gray-700">Certificado de Antecedentes:</strong> Máximo 30 días de antigüedad.</li>
              </ul>
            </div>

            <input type="file" name="antecedentes" multiple onChange={handleLegalChange} accept=".jpg,.jpeg,.png,.pdf" className="w-full bg-white text-gray-700 file:mr-4 file:py-2.5 file:px-6 file:rounded-md file:border-0 file:font-bold file:bg-[#1b3b2c] file:text-white hover:file:bg-opacity-90 border border-gray-200 rounded-md shadow-sm" />
            
            {archivosLegales.antecedentes.length > 0 && (
              <div className="mt-4 space-y-2">
                {archivosLegales.antecedentes.map((file, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 text-sm shadow-sm">
                    <span className="truncate max-w-[200px] font-medium text-gray-700">📄 {file.name}</span>
                    <button type="button" onClick={() => removerArchivoLegal('antecedentes', idx)} className="text-red-500 hover:text-red-700 font-bold px-3 py-1 rounded bg-red-50 border border-red-100 hover:bg-red-100 transition-colors">✕ Quitar</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-300">
            <button type="submit" disabled={procesando} className="w-full bg-[#1b3b2c] hover:bg-opacity-90 text-[#e8c582] font-extrabold text-lg py-4 rounded-md transition-all shadow-md">
              {procesando ? 'Enviando a Auditoría...' : 'Enviar Documentos y Volver ✓'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioDocumentos;