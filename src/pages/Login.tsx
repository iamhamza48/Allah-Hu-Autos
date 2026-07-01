import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const { signIn, signOut, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && isAdmin) navigate('/admin', { replace: true });
  }, [loading, user, isAdmin, navigate]);

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      void signOut();
      setSubmitting(false);
    }
  }, [loading, user, isAdmin, signOut]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setMessage(null);
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    if (error) {
      setMessage({
        type: 'error',
        text: error.message === 'not_authorised'
          ? 'This account does not have administrator access.'
          : 'The email or password is incorrect.',
      });
      setSubmitting(false);
    }
  };

  const handleRecovery = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setMessage(null);
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    setSubmitting(false);
    if (error) return setMessage({ type: 'error', text: 'Unable to send the recovery email. Please try again.' });
    setMessage({ type: 'success', text: 'If that administrator account exists, a recovery link has been sent.' });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.22),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_34%)]" />
      <div className="relative w-full max-w-[420px]">
        <Link to="/" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to store
        </Link>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="border-b border-white/10 px-6 py-7 text-center sm:px-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
              <img src="/logo.webp" alt="Allah Hu Autos" className="h-12 w-12 object-contain" />
            </div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure administration
            </div>
            <h1 className="text-2xl font-black tracking-tight">{forgotMode ? 'Recover access' : 'Welcome back'}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {forgotMode ? 'Enter the administrator email to receive a secure reset link.' : 'Sign in to manage orders, products and bookings.'}
            </p>
          </div>

          <form onSubmit={forgotMode ? handleRecovery : handleLogin} className="space-y-5 px-6 py-7 sm:px-8">
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-xs font-bold uppercase tracking-wider text-slate-300">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input id="admin-email" type="email" autoComplete="username" className="h-12 border-slate-700 bg-slate-950/70 pl-10 text-white placeholder:text-slate-600 focus-visible:ring-blue-500" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@allahhuautos.pk" required autoFocus />
              </div>
            </div>

            {!forgotMode && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-password" className="text-xs font-bold uppercase tracking-wider text-slate-300">Password</Label>
                  <button type="button" onClick={() => { setForgotMode(true); setMessage(null); }} className="text-xs font-semibold text-blue-400 hover:text-blue-300">Forgot password?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input id="admin-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" className="h-12 border-slate-700 bg-slate-950/70 pl-10 pr-11 text-white focus-visible:ring-blue-500" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-white" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {message && (
              <div role="status" aria-live="polite" className={`rounded-xl border px-3.5 py-3 text-sm leading-5 ${message.type === 'error' ? 'border-red-400/20 bg-red-500/10 text-red-200' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'}`}>
                {message.text}
              </div>
            )}

            <Button type="submit" className="h-12 w-full rounded-xl bg-blue-600 font-bold hover:bg-blue-500" disabled={submitting || loading}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {forgotMode ? 'Send recovery link' : 'Sign in securely'}
            </Button>

            {forgotMode && (
              <button type="button" onClick={() => { setForgotMode(false); setMessage(null); }} className="w-full text-center text-sm font-medium text-slate-400 hover:text-white">Return to sign in</button>
            )}
          </form>
        </section>
        <p className="mt-5 text-center text-xs text-slate-600">Authorised personnel only · Allah Hu Autos</p>
      </div>
    </div>
  );
};

export default Login;
