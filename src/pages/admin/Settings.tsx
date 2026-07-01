import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Branch } from '@/types/database';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, MapPin, KeyRound, Loader2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getBranchFields, serializeBranchFields } from '@/lib/branch-utils';

const emptyForm = {
  name: '',
  address: '',
  map_iframe_url: '',
  map_link: '',
  hours: 'Mon–Sat: 10AM – 9PM',
  city: '',
  phone: '',
  is_active: true
};

const AdminSettings = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchBranches = async () => {
    setLoading(true);
    const { data } = await supabase.from('branches').select('*').order('name');
    setBranches(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchBranches(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (b: Branch) => {
    setEditing(b);
    const fields = getBranchFields(b.address);
    setForm({
      name: b.name,
      address: fields.address,
      map_iframe_url: fields.map_iframe_url,
      map_link: fields.map_link,
      hours: fields.hours,
      city: b.city || '',
      phone: b.phone || '',
      is_active: b.is_active ?? true
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Branch name is required');
    setSaving(true);

    const serializedAddress = serializeBranchFields({
      address: form.address,
      map_iframe_url: form.map_iframe_url,
      map_link: form.map_link,
      hours: form.hours
    });

    const payload = {
      name: form.name,
      address: serializedAddress,
      city: form.city,
      phone: form.phone,
      is_active: form.is_active
    };

    if (editing) {
      const { error } = await supabase.from('branches').update(payload).eq('id', editing.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success('Branch updated');
    } else {
      const { error } = await supabase.from('branches').insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success('Branch created');
    }
    setSaving(false);
    setDialogOpen(false);
    fetchBranches();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this branch?')) return;
    const { error } = await supabase.from('branches').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Branch deleted');
    fetchBranches();
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 12) return toast.error('The new password must contain at least 12 characters.');
    if (newPassword !== confirmPassword) return toast.error('The new passwords do not match.');
    if (currentPassword === newPassword) return toast.error('Choose a password different from the current one.');

    setChangingPassword(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setChangingPassword(false);
      return toast.error('Your administrator session has expired. Please sign in again.');
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (verifyError) {
      setChangingPassword(false);
      return toast.error('The current password is incorrect.');
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) return toast.error('The password could not be changed. Please try again.');

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Administrator password changed successfully.');
  };

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        subtitle="Manage administrator security and service locations"
        action={
          <Button size="sm" className="h-8 text-xs" onClick={openAdd}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Branch
          </Button>
        }
      />

      <Card className="mb-6 overflow-hidden border-blue-100 shadow-none dark:border-slate-800">
        <div className="border-b bg-blue-50/60 px-5 py-4 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white"><KeyRound className="h-5 w-5" /></div>
            <div>
              <h2 className="font-bold">Administrator password</h2>
              <p className="text-xs text-muted-foreground">Use a unique password with at least 12 characters.</p>
            </div>
          </div>
        </div>
        <form onSubmit={handlePasswordChange} className="grid gap-4 p-5 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="current-admin-password" className="text-xs font-semibold">Current password</Label>
            <Input id="current-admin-password" type="password" autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-admin-password" className="text-xs font-semibold">New password</Label>
            <Input id="new-admin-password" type="password" autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} minLength={12} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-admin-password" className="text-xs font-semibold">Confirm new password</Label>
            <Input id="confirm-admin-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} minLength={12} required />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <Button type="submit" disabled={changingPassword}>
              {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change password
            </Button>
          </div>
        </form>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div>
              <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Branch Name *</Label>
              <Input className="mt-1.5" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Gulberg Branch" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Street Address</Label>
              <Input className="mt-1.5" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Street address" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Google Maps Embed Iframe URL</Label>
              <Input className="mt-1.5" value={form.map_iframe_url} onChange={e => setForm({ ...form, map_iframe_url: e.target.value })} placeholder="https://www.google.com/maps/embed?pb=..." />
              <p className="text-[10px] text-zinc-400 mt-1">{"Copy the iframe 'src' attribute from Share -> Embed Map on Google Maps."}</p>
            </div>
            <div>
              <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Google Maps Directions Link</Label>
              <Input className="mt-1.5" value={form.map_link} onChange={e => setForm({ ...form, map_link: e.target.value })} placeholder="https://maps.app.goo.gl/... or google.com/maps/place/..." />
            </div>
            <div>
              <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Working Hours</Label>
              <Input className="mt-1.5" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} placeholder="e.g. Mon–Sat: 10AM – 9PM" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">City</Label>
                <Input className="mt-1.5" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="e.g. Lahore" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Phone</Label>
                <Input className="mt-1.5" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0300-0000000" />
              </div>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-zinc-50 rounded-lg border border-zinc-100">
              <div>
                <p className="text-sm font-medium text-zinc-800">Active</p>
                <p className="text-xs text-zinc-400">Branch is open for bookings</p>
              </div>
              <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Branch'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <Card className="shadow-none">
          <div className="divide-y">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4">
                <div className="h-3 bg-zinc-100 rounded w-32 animate-pulse" />
                <div className="h-3 bg-zinc-100 rounded w-20 animate-pulse" />
                <div className="h-3 bg-zinc-100 rounded w-16 animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        </Card>
      ) : branches.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 border border-dashed border-zinc-200 rounded-xl bg-white">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="font-medium text-zinc-500">No branches yet</p>
          <p className="text-sm mt-1">Add your first service location</p>
        </div>
      ) : (
        <Card className="shadow-none overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Name</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">City</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Phone</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</TableHead>
                <TableHead className="text-right text-xs font-semibold text-zinc-500 uppercase tracking-wide">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((b) => (
                <TableRow key={b.id} className="hover:bg-zinc-50/60">
                  <TableCell>
                    <div className="font-medium text-sm text-zinc-900">{b.name}</div>
                    {b.address && <div className="text-[11px] text-zinc-400">{getBranchFields(b.address).address}</div>}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-700">{b.city || '—'}</TableCell>
                  <TableCell className="text-sm text-zinc-700">{b.phone || '—'}</TableCell>
                  <TableCell>
                    {b.is_active ? (
                      <span className="inline-flex text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">Active</span>
                    ) : (
                      <span className="inline-flex text-[11px] font-semibold text-zinc-400 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-md">Inactive</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}>
                        <Pencil className="h-3.5 w-3.5 text-zinc-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10" onClick={() => handleDelete(b.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default AdminSettings;
