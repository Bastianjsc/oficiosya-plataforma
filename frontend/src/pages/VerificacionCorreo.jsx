import { useLocation, useNavigate } from 'react-router-dom';

const VerificacionCorreo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Obtenemos el motivo de la redirección desde el estado (por defecto asumimos registro)
  const motivo = location.state?.motivo || 'registro';
  const email = location.state?.email || 'tu correo electrónico';

  // Textos dinámicos dependiendo de si es registro o recuperación
  const titulo = motivo === 'recuperacion' ? 'Revisa tu bandeja de entrada' : '¡Casi listo! Verifica tu cuenta';
  const descripcionPrincipal = motivo === 'recuperacion' 
    ? `Hemos enviado un enlace seguro para restablecer tu contraseña a:` 
    : `Hemos enviado un enlace de confirmación para activar tu cuenta a:`;

  const handleContinuar = () => {
    // Simulamos continuar el proceso (en producción aquí se validaría el token del correo)
    if (motivo === 'recuperacion') {
      // Pasamos el correo a la siguiente vista para saber a quién cambiarle la clave
      navigate('/restablecer-password', { state: { email } });
    } else {
      // Si era registro y es prestador, lo mandamos al onboarding. Si es cliente, al login.
      const rol = location.state?.rol || 'Cliente';
      if (rol === 'Prestador') {
        navigate('/onboarding');
      } else {
        navigate('/login');
      }
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-6 bg-[#f5f1ea] min-h-screen">
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl w-full max-w-lg border border-gray-200 text-center relative overflow-hidden">
        
        {/* Decoración superior */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#1b3b2c]"></div>

        {/* Icono de Correo Animado (CSS simple) */}
        <div className="mx-auto w-24 h-24 bg-[#f5f1ea] rounded-full flex items-center justify-center mb-8 border-4 border-[#e8c582] shadow-sm">
          <span className="text-5xl">✉️</span>
        </div>

        <h2 className="text-3xl font-extrabold text-[#1b3b2c] mb-4">
          {titulo}
        </h2>
        
        <p className="text-lg text-gray-700 font-medium mb-2">
          {descripcionPrincipal}
        </p>
        <p className="text-xl font-extrabold text-[#1b3b2c] mb-8 p-3 bg-gray-50 rounded-md border border-gray-200 inline-block">
          {email}
        </p>

        {/* Caja de Advertencia Fuerte */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 text-left">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-yellow-800">
                Aviso Importante
              </h3>
              <div className="mt-1 text-sm text-yellow-700 font-medium">
                <p>
                  Esta es una versión de prueba. <strong>Aún no se están enviando correos reales.</strong> 
                  <br className="mb-2"/>
                  Para continuar con el flujo normal de la plataforma como si hubieras hecho clic en el enlace del correo, presiona el botón de abajo.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleContinuar}
          className="w-full bg-[#1b3b2c] hover:bg-opacity-90 text-[#e8c582] font-extrabold text-lg py-4 rounded-md shadow-md transition-all mb-4"
        >
          [Simular Clic en Correo] Continuar →
        </button>
        
        <p className="text-sm text-gray-500 font-bold">
          ¿No recibiste el correo? <button className="text-[#1b3b2c] hover:underline focus:outline-none">Reenviar enlace</button>
        </p>
      </div>
    </div>
  );
};

export default VerificacionCorreo;