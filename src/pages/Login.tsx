import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      toast.success('Welcome back to Allah-Hu-Autos!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50/50 px-4 py-12 font-sans">
      <div className="w-full max-w-md space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-orange-600 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <Card className="border-zinc-200 shadow-2xl shadow-zinc-200/50 rounded-2xl overflow-hidden bg-white">
          <CardHeader className="text-center space-y-1 pb-8 pt-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/20">
              <span className="text-2xl font-black text-white">A</span>
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-zinc-900">Welcome Back</CardTitle>
            <CardDescription className="text-zinc-500 font-medium">Login to your Allah-Hu-Autos account</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-700 font-bold ml-1">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="pl-11 h-11 bg-zinc-50/50 border-zinc-200 rounded-xl focus:bg-white transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-zinc-700 font-bold">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-orange-600 font-bold hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-11 h-11 bg-zinc-50/50 border-zinc-200 rounded-xl focus:bg-white transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 font-black text-base rounded-xl shadow-lg shadow-orange-500/25 transition-all active:scale-[0.98]"
                disabled={loading}
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

          <CardFooter className="bg-zinc-50/50 border-t border-zinc-100 py-6 flex flex-col gap-2 justify-center items-center">
            <p className="text-sm text-zinc-500 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-orange-600 font-black hover:underline ml-1">
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