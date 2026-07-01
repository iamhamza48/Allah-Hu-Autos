import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import Login from '@/pages/Login';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white shadow-xl">
            <img src="/logo.webp" alt="" className="h-10 w-10 object-contain" />
          </div>
          <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
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
