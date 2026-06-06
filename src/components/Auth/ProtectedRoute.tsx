// GUARDIÁN DE JUGUETE
import { Navigate, Outlet } from 'react-router-dom';
import { LocalStorageProvider } from '../../storage/LocalStorageProvider';
import { User } from '../../models/User';

const storage = new LocalStorageProvider();

// Función para verificar si el usuario está autenticado
const isAuthenticated = () => {
  const user = storage.getItem('user');
    // no autenticado
  if (!user) return false;

  try {
    // en el local storage está el usuario como string, al usar el JSON.parse(user) se coniverte a objeto
    const parsedUser : User= JSON.parse(user);
    // si el usuario no está null, devuelve true
    return !!parsedUser; // puedes validar más campos aquí si quieres
  } catch (error) {
    return false;
  }
};

// Componente de Ruta Protegida
const ProtectedRoute = () => {
  return isAuthenticated() ? (
    <Outlet />
  ) : (
    <Navigate to="/auth/signin" replace />
  );
};

export default ProtectedRoute;
