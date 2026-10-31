import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex flex-1 items-center justify-center py-16 text-sm text-muted-foreground">
        …
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
