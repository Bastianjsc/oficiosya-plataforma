const Alert = ({ mensaje, tipo }) => {
  if (!mensaje || !mensaje.texto) return null;

  const bgStyles = 
    tipo === 'success' ? 'bg-green-100 text-green-800 border-green-200' : 
    tipo === 'error' ? 'bg-red-100 text-red-800 border-red-200' : 
    'bg-blue-100 text-blue-800 border-blue-200';

  return (
    <div className={`p-4 mb-6 rounded-md text-sm font-bold border ${bgStyles}`}>
      {mensaje.texto}
    </div>
  );
};

export default Alert;