const InsigniaVerificada = ({ className = "w-6 h-6" }) => {
  return (
    <svg 
      className={`inline-block flex-shrink-0 ${className}`} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      title="Cuenta Verificada"
    >
      {/* Borde de escudo color dorado (#e8c582) con fondo blanco para que resalte */}
      <path 
        d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" 
        stroke="#1b3b2c" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="#ffffff" 
      />
      {/* Visto bueno color verde institucional (#1b3b2c) */}
      <path 
        d="M9 12L11 14L15 10" 
        stroke="#1b3b2c" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
};

export default InsigniaVerificada;