import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Shield } from 'lucide-react';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Shield className="h-8 w-8 text-orange-500 animate-pulse" />
          <p className="text-sm text-zinc-400 font-medium">Verifying access…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default AdminRoute;