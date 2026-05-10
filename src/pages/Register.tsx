import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Phone, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

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
  const [done, setDone] = useState(false);
  const { signUp } = useAuth();
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

        <Card className="border-border shadow-xl rounded-3xl overflow-hidden bg-card">
          <CardHeader className="text-center space-y-1 pb-8 pt-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <span className="text-2xl font-black">A</span>
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-foreground">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Join Pakistan's premier auto community</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
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
                    className={`pl-11 h-12 bg-muted/30 rounded-xl focus:bg-card transition-all font-medium border-2 ${
                      !passwordsMatch
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