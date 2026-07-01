import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AdminResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 12) return toast.error('Use at least 12 characters.');
    if (password !== confirmPassword) return toast.error('The passwords do not match.');
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) return toast.error('The recovery link is invalid or has expired. Request a new one.');
    toast.success('Password updated successfully.');
    navigate('/admin', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07111f] px-4 py-10 text-white">
      <section className="w-full max-w-[420px] rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400"><KeyRound className="h-6 w-6" /></div>
        <h1 className="text-2xl font-black">Set a new password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Use at least 12 characters and avoid passwords used on other websites.</p>
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <div className="relative">
              <Input id="new-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" className="h-12 border-slate-700 bg-slate-950 pr-11 text-white" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input id="confirm-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" className="h-12 border-slate-700 bg-slate-950 text-white" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </div>
          <Button className="h-12 w-full bg-blue-600 font-bold hover:bg-blue-500" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Update password</Button>
        </form>
      </section>
    </div>
  );
};

export default AdminResetPassword;
