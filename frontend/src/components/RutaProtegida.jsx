import { Navigate } from 'react-router-dom';

const RutaProtegida = ({ children, rolesPermitidos }) => {
  const token = localStorage.getItem('token');

  // 1. Si no hay token (es un invitado), lo enviamos al Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    // 2. Desencriptar el payload del token para saber quién es
    const payload = JSON.parse(atob(token.split('.')[1]));
    const rolUsuario = payload.rol;

    // 3. Verificar si el rol del usuario está en la lista de roles permitidos para esta página
    if (rolesPermitidos && !rolesPermitidos.includes(rolUsuario)) {
      
      // Si no tiene permiso, lo redirigimos automáticamente a su panel correspondiente
      if (rolUsuario === 'Cliente') return <Navigate to="/cliente" replace />;
      if (rolUsuario === 'Prestador') return <Navigate to="/prestador" replace />;
      if (rolUsuario === 'Admin') return <Navigate to="/admin" replace />;
      
      return <Navigate to="/" replace />;
    }

    // 4. Si pasa todas las validaciones, renderizamos el componente solicitado
    return children;

  } catch (error) {
    // Si alguien manipula el token manualmente en el navegador y lo corrompe, lo borramos y lo mandamos al login
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

export default RutaProtegida;