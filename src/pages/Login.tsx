import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';

// Google icon SVG component
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signInWithGoogle, isAdmin, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  // Redirect after sign-in: admins go to /admin, others go to redirect target
  useEffect(() => {
    if (!authLoading && user) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [user, isAdmin, authLoading, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      toast.success('Welcome back to Allah-Hu-Autos!');
      // Navigation handled by useEffect above after auth state updates
    } catch (error: any) {
      toast.error(error.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // Supabase redirects to Google — no client-side nav needed
    } catch (error: any) {
      toast.error(error.message || 'Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 font-sans">
      <div className="w-full max-w-md space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <Card className="border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
          <CardHeader className="text-center space-y-1 pb-6 pt-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25">
              <span className="text-2xl font-black">A</span>
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Welcome Back</CardTitle>
            <CardDescription className="text-gray-500 font-medium">Login to your Allah-Hu-Autos account</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 px-8">
            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              ) : (
                <GoogleIcon />
              )}
              {googleLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-3 text-gray-400 font-semibold tracking-wider">or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300 font-bold ml-1">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="pl-11 h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:border-primary focus:ring-primary/20 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-gray-700 dark:text-gray-300 font-bold">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-primary font-bold hover:underline">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-11 h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:border-primary focus:ring-primary/20 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 font-black text-base rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                  </span>
                ) : (
                  'Login to Ride'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 py-6 flex flex-col gap-2 justify-center items-center">
            <p className="text-sm text-gray-500 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-black hover:underline ml-1">
                Register Now
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;