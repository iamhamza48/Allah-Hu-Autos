import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signOut, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return;
    if (isAdmin) navigate('/admin', { replace: true });
  }, [loading, user, isAdmin, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    if (error) {
      toast.error(error.message || 'Invalid administrator credentials');
      setSubmitting(false);
      return;
    }
  };

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      toast.error('This account does not have administrator access');
      void signOut();
      setSubmitting(false);
    }
  }, [loading, user, isAdmin, signOut]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md space-y-5">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to store
        </Link>
        <Card className="border-slate-800 bg-slate-900 text-white shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Shield className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl">Administrator Login</CardTitle>
            <CardDescription className="text-slate-400">Customer accounts are not required to shop.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input id="admin-email" type="email" autoComplete="username" className="pl-10 bg-slate-950 border-slate-700" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input id="admin-password" type="password" autoComplete="current-password" className="pl-10 bg-slate-950 border-slate-700" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting || loading}>
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</> : 'Sign in to admin'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
