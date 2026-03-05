import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

interface Props {
  requiredRole?: 'ADMIN' | 'EMPLOYEE';
}

export default function ProtectedRoute({ requiredRole }: Props) {
  const { user, loading } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  if (loading) {
    return 'Loading...';
  }
  return <Outlet />;
}
