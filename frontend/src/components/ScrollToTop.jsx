import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  // Extraemos la ruta actual (pathname) del hook useLocation
  const { pathname } = useLocation();

  useEffect(() => {
    // Cada vez que el pathname cambie, le decimos a la ventana que haga scroll a la posición (0,0)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // 'smooth' para un desplazamiento suave, o 'auto' para instantáneo
    });
  }, [pathname]);

  // Este componente no renderiza nada visual, solo ejecuta lógica
  return null; 
};

export default ScrollToTop;