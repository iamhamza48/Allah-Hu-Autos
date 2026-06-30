import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Shield } from 'lucide-react';
import Login from '@/pages/Login';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Shield className="h-8 w-8 text-primary animate-pulse" />
          <p className="text-sm text-zinc-400 font-medium">Verifying access…</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    // Authentication belongs exclusively to the admin entry point. Deep admin
    // links return here instead of exposing a separate public login route.
    if (location.pathname !== '/admin') return <Navigate to="/admin" replace />;
    return <Login />;
  }

  return <>{children}</>;
};

export default AdminRoute;
