import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirectTo=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
