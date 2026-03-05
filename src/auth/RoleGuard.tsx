import { useAuth } from '../hooks/useAuth';

interface RoleGuardProps {
  roles: ('ADMIN' | 'EMPLOYEE')[];
  children: React.ReactNode;
}

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
