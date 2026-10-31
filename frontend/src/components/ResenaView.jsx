const ResenaView = ({ onClose, resenas = [] }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-white p-8 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col relative shadow-2xl">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-3xl font-bold text-gray-500 hover:text-red-500 transition-colors leading-none"
        >
          &times;
        </button>
        <h3 className="text-2xl font-extrabold mb-6 text-[#1b3b2c] border-b pb-4">Reseñas de Clientes</h3>
        
        <div className="overflow-y-auto space-y-4 flex-grow pr-2">
          {resenas.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-4xl block mb-4">💬</span>
              <p className="font-bold text-gray-500 text-lg">Aún no tienes reseñas.</p>
            </div>
          ) : (
            resenas.map((r, idx) => {
              // Mapeo robusto para aceptar diferentes estructuras de datos del backend
              const nombreCliente = r.cliente?.nombre || r.nombreCliente || 'Usuario Anónimo';
              const comentario = r.calificacion?.comentario || r.comentario || '';
              const estrellas = r.calificacion?.estrellas || r.estrellas || 5;

              return (
                <div key={r._id || idx} className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <p className="font-extrabold text-[#1b3b2c]">{nombreCliente}</p>
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded font-bold text-sm border border-yellow-200">
                      <span className="text-[#e8c582]">⭐</span> {estrellas}
                    </div>
                  </div>
                  <p className="italic text-sm text-gray-700 font-medium">"{comentario}"</p>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button 
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded font-extrabold text-sm hover:bg-gray-300 transition-colors shadow-sm"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResenaView;