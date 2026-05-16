import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

/**
 * OAuth Callback Page
 * Supabase redirects here after Google OAuth completes.
 * We exchange the code/token, then redirect the user based on their role.
 */
const AuthCallback = () => {
    const navigate = useNavigate();
    const { isAdmin, loading, user } = useAuth();

    useEffect(() => {
        // On mount, exchange the URL hash/code for a session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // No session — could be an error or direct navigation, go to login
                navigate('/login', { replace: true });
            }
            // AuthProvider's onAuthStateChange will fire and update isAdmin.
            // The second useEffect below handles navigation once loading is done.
        });
    }, [navigate]);

    // Wait for auth to finish loading, then redirect based on role
    useEffect(() => {
        if (!loading && user) {
            if (isAdmin) {
                navigate('/admin', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } else if (!loading && !user) {
            navigate('/login', { replace: true });
        }
    }, [loading, user, isAdmin, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
                <div>
                    <p className="text-lg font-black text-gray-900 dark:text-white">Signing you in…</p>
                    <p className="text-sm text-gray-500 mt-1">Please wait while we verify your account.</p>
                </div>
            </div>
        </div>
    );
};

export default AuthCallback;
