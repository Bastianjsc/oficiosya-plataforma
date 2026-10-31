const EstadoBadge = ({ estado }) => {
  let bgClass = 'bg-gray-100 text-gray-800 border-gray-300';
  
  switch(estado) {
    case 'Pendiente': bgClass = 'bg-yellow-100 text-yellow-800 border-yellow-300'; break;
    case 'Cotizado': bgClass = 'bg-blue-100 text-blue-800 border-blue-300'; break;
    case 'Aceptado': bgClass = 'bg-green-100 text-green-800 border-green-300'; break;
    case 'Rechazado': bgClass = 'bg-red-100 text-red-800 border-red-300'; break;
    case 'Finalizado': bgClass = 'bg-gray-100 text-gray-800 border-gray-300'; break;
    default: break;
  }

  return (
    <span className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-sm ${bgClass}`}>
      {estado}
    </span>
  );
};

export default EstadoBadge;