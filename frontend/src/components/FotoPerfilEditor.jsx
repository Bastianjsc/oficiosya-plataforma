import { useState, useRef, useEffect } from 'react';

const FotoPerfilEditor = ({ perfil, onActualizar, tema = 'oscuro', tamaño = 'grande' }) => {
  const [editando, setEditando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [fotoArchivo, setFotoArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  if (!perfil) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (preview) URL.revokeObjectURL(preview);

    if (file) {
      setFotoArchivo(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setFotoArchivo(null);
      setPreview(null);
    }
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setFotoArchivo(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGuardarCambio = async (e, eliminar = false) => {
    if (e) e.preventDefault();
    setProcesando(true);
    
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    if (eliminar) {
      if (!window.confirm("¿Estás seguro de que deseas eliminar tu foto de perfil?")) {
        setProcesando(false);
        return;
      }
      formData.append('eliminarFoto', 'true');
      formData.append('nombre', perfil.nombre);
    } else if (fotoArchivo) {
      formData.append('fotoPerfil', fotoArchivo);
    } else {
      setProcesando(false);
      return cancelarEdicion();
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/perfil`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        cancelarEdicion();
        onActualizar(); 
      } else {
        alert(data.message || 'Error al actualizar perfil');
      }
    } catch (err) {
      console.error("Error procesando foto:", err);
      alert("Error de conexión al servidor.");
    } finally {
      setProcesando(false);
    }
  };

  let contenedorClases;
  let textoInicialClases = "font-extrabold flex items-center justify-center h-full w-full uppercase ";

  if (tamaño === 'grande') {
    contenedorClases = "w-32 h-32 border-4";
    textoInicialClases += "text-5xl";
  } else if (tamaño === 'mediano') {
    contenedorClases = "w-24 h-24 sm:w-32 sm:h-32 border-4";
    textoInicialClases += "text-4xl";
  } else {
    contenedorClases = "w-12 h-12 border-2";
    textoInicialClases += "text-2xl";
  }

  if (tema === 'oscuro') {
    contenedorClases += " bg-[#1b3b2c] border-[#e8c582] text-white";
    textoInicialClases += " text-white";
  } else {
    contenedorClases += " bg-gray-200 border-[#1b3b2c] text-[#1b3b2c]";
    textoInicialClases += " text-[#1b3b2c]";
  }

  const imageUrl = preview 
    ? preview 
    : (perfil.fotoPerfil 
        ? (perfil.fotoPerfil.startsWith('http') ? perfil.fotoPerfil : `${import.meta.env.VITE_API_URL}/${perfil.fotoPerfil}`) 
        : null);

  const overlayStyle = {
    backgroundColor: editando ? 'rgba(0,0,0,0.65)' : (isHovering ? 'rgba(0,0,0,0.4)' : 'transparent')
  };
  const iconOpacity = editando || isHovering ? 1 : 0;

  return (
    <div className="flex flex-col items-center justify-center relative">
      
      <div className={`${contenedorClases} rounded-full flex items-center justify-center shadow-inner relative overflow-hidden flex-shrink-0`}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Perfil" 
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${procesando ? 'opacity-50 blur-sm grayscale' : 'opacity-100'}`} 
          />
        ) : (
          <div className={textoInicialClases}>{perfil.nombre?.charAt(0)}</div>
        )}
        
        {procesando && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-10">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        <div 
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={() => !procesando && setEditando(!editando)}
          className="absolute inset-0 transition-all duration-300 cursor-pointer flex items-center justify-center z-20"
          style={overlayStyle}
          title="Modificar Foto"
        >
          <span 
            className={`text-white font-bold drop-shadow-md transition-opacity duration-300 ${tamaño === 'pequeño' ? 'text-sm' : 'text-3xl'}`}
            style={{ opacity: iconOpacity }}
          >
            {editando ? '✖' : '📷'}
          </span>
        </div>
      </div>

      {editando && (
        <form 
          onSubmit={(e) => handleGuardarCambio(e, false)} 
          // --- CORRECCIÓN AQUÍ: Se asegura que el menú en tamaño pequeño nazca desde la izquierda (left-0) ---
          className={`bg-white p-4 rounded-md border border-gray-300 shadow-xl z-50 ${tamaño === 'pequeño' ? 'absolute top-14 left-0 min-w-[260px]' : 'w-full mt-4'}`}
        >
          <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
            <label className="block text-sm font-extrabold text-[#1b3b2c]">Actualizar Foto</label>
            <button type="button" onClick={cancelarEdicion} className="text-gray-400 hover:text-red-500 font-bold text-xl leading-none">&times;</button>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            className="w-full text-xs mb-4 file:mr-3 file:py-1.5 file:px-4 file:rounded file:border-0 file:bg-[#1b3b2c] file:text-[#e8c582] file:font-bold cursor-pointer file:cursor-pointer" 
          />
          
          <div className="flex flex-col gap-2">
            <button 
              type="submit" 
              disabled={procesando || !fotoArchivo} 
              className={`w-full text-xs font-bold py-2.5 rounded shadow-sm transition-all ${procesando || !fotoArchivo ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#1b3b2c] text-[#e8c582] hover:bg-opacity-90'}`}
            >
              {procesando ? 'Guardando...' : 'Guardar Nueva Foto'}
            </button>
            
            {perfil.fotoPerfil && (
              <button 
                type="button" 
                onClick={(e) => handleGuardarCambio(e, true)} 
                disabled={procesando} 
                className="w-full bg-white text-red-600 border border-red-200 text-xs font-bold py-2 rounded shadow-sm hover:bg-red-50 transition-colors mt-1"
              >
                🗑️ Eliminar Foto Actual
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default FotoPerfilEditor;