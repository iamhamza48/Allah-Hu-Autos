import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Phone, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

// Google icon SVG
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const PasswordStrength = ({ password }: { password: string }) => {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'One number', ok: /\d/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ['bg-muted', 'bg-destructive', 'bg-primary', 'bg-emerald-600'];
  const labels = ['', 'Weak', 'Fair', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-1.5 items-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${i < score ? colors[score] : 'bg-muted/60'}`}
          />
        ))}
        <span className={`text-[10px] font-black uppercase ml-1 tracking-wider ${score === 3 ? 'text-emerald-600' : score === 2 ? 'text-primary' : 'text-destructive'}`}>
          {labels[score]}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-1">
        {checks.map((c) => (
          <div key={c.label} className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight transition-colors ${c.ok ? 'text-green-600' : 'text-zinc-400'}`}>
            <CheckCircle2 className={`h-3 w-3 shrink-0 ${c.ok ? 'fill-green-100' : ''}`} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const Register = () => {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const passwordsMatch = form.confirm === '' || form.password === form.confirm;
  const isValid =
    form.fullName.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.phone.trim().length >= 10 &&
    form.password.length >= 8 &&
    form.password === form.confirm;

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    try {
      const { error } = await signUp(form.email, form.password, form.fullName.trim(), form.phone.trim());
      if (error) throw error;
      setDone(true);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center px-4 bg-background">
        <div className="w-full max-w-md text-center p-8 bg-card rounded-3xl border border-border shadow-xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 border-4 border-card shadow-xl">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-3 tracking-tight">Check your inbox!</h2>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            We've sent a verification link to <br />
            <span className="text-foreground font-bold">{form.email}</span>.<br />
            Click the link in the email to activate your account.
          </p>
          <Button
            onClick={() => navigate('/login')}
            className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 font-sans">
      <div className="w-full max-w-md space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <Card className="border-gray-200 dark:border-gray-700 shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-gray-900">
          <CardHeader className="text-center space-y-1 pb-6 pt-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25">
              <span className="text-2xl font-black">A</span>
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Create Account</CardTitle>
            <CardDescription className="text-gray-500 font-medium">Join Pakistan's premier auto community</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 px-8 pb-6">
            {/* Google Sign Up */}
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
              {googleLoading ? 'Redirecting...' : 'Sign up with Google'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-3 text-gray-400 font-semibold tracking-wider">or register with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label className="text-foreground font-bold ml-1 uppercase text-[10px] tracking-widest">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Muhammad Ali"
                    className="pl-11 h-12 bg-muted/30 border-border rounded-xl focus:bg-card transition-all font-medium"
                    value={form.fullName}
                    onChange={set('fullName')}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-foreground font-bold ml-1 uppercase text-[10px] tracking-widest">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="ali@example.com"
                    className="pl-11 h-12 bg-muted/30 border-border rounded-xl focus:bg-card transition-all font-medium"
                    value={form.email}
                    onChange={set('email')}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label className="text-foreground font-bold ml-1 uppercase text-[10px] tracking-widest">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="03XX XXXXXXX"
                    className="pl-11 h-12 bg-muted/30 border-border rounded-xl focus:bg-card transition-all font-medium"
                    value={form.phone}
                    onChange={set('phone')}
                    required
                  />
                </div>
                <p className="text-[10px] text-muted-foreground ml-1">Used for order updates and delivery coordination</p>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label className="text-foreground font-bold ml-1 uppercase text-[10px] tracking-widest">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-11 pr-11 h-12 bg-muted/30 border-border rounded-xl focus:bg-card transition-all font-medium"
                    value={form.password}
                    onChange={set('password')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label className="text-foreground font-bold ml-1 uppercase text-[10px] tracking-widest">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className={`pl-11 h-12 bg-muted/30 rounded-xl focus:bg-card transition-all font-medium border-2 ${!passwordsMatch
                        ? 'border-destructive/30 focus:border-destructive'
                        : 'border-border focus:border-primary'
                      }`}
                    value={form.confirm}
                    onChange={set('confirm')}
                    required
                  />
                </div>
                {!passwordsMatch && (
                  <p className="text-[10px] font-black text-destructive uppercase tracking-tight ml-1">
                    Passwords do not match
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] mt-4"
                disabled={loading || !isValid}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
                  </span>
                ) : (
                  'Start your Journey'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="bg-muted/20 border-t border-border py-6 flex flex-col gap-2 justify-center items-center">
            <p className="text-sm text-muted-foreground font-medium">
              Already a member?{' '}
              <Link to="/login" className="text-primary font-black hover:underline ml-1">
                Login Here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;