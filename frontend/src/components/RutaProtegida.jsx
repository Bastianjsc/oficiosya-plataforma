import { Navigate, Outlet } from 'react-router-dom';

const RutaProtegida = ({ rolRequerido }) => {
  let tokenValido = false;
  let rolUsuario = '';

  // 1. Validamos el token dentro del try/catch de forma aislada
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const payloadToken = JSON.parse(atob(token.split('.')[1]));
      rolUsuario = payloadToken.rol;
      tokenValido = true;
    }
  } catch (error) {
    console.error("Error al validar el token de acceso:", error); // Soluciona la advertencia de variable no usada
    tokenValido = false;
  }

  // 2. Si no hay token válido, redirigimos al login fuera del try/catch
  if (!tokenValido) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si se requiere un rol específico y no coincide, redirigimos a su panel correspondiente
  if (rolRequerido && rolUsuario !== rolRequerido) {
    if (rolUsuario === 'Cliente') return <Navigate to="/cliente" replace />;
    if (rolUsuario === 'Prestador') return <Navigate to="/prestador" replace />;
    if (rolUsuario === 'Admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  // 4. Si pasa todas las validaciones, renderizamos el componente hijo
  return <Outlet />;
};

export default RutaProtegida;