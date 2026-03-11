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
import { Plus, Pencil, Trash2 } from 'lucide-react';

const AdminSettings = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState({ name: '', address: '', city: '', phone: '', is_active: true });

  const fetch = async () => {
    const { data } = await supabase.from('branches').select('*').order('name');
    setBranches(data || []);
  };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (editing) {
      await supabase.from('branches').update(form).eq('id', editing.id);
      toast.success('Updated');
    } else {
      await supabase.from('branches').insert(form);
      toast.success('Created');
    }
    setDialogOpen(false);
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await supabase.from('branches').delete().eq('id', id);
    toast.success('Deleted');
    fetch();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Branch Management</h2>
      <Button className="mb-4" onClick={() => { setEditing(null); setForm({ name: '', address: '', city: '', phone: '', is_active: true }); setDialogOpen(true); }}>
        <Plus className="h-4 w-4 mr-1" /> Add Branch
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Branch</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Active</Label></div>
            <Button onClick={handleSave} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>City</TableHead><TableHead>Phone</TableHead><TableHead>Active</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {branches.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell>{b.city}</TableCell>
                <TableCell>{b.phone}</TableCell>
                <TableCell>{b.is_active ? '✅' : '❌'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(b); setForm({ name: b.name, address: b.address, city: b.city, phone: b.phone, is_active: b.is_active }); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminSettings;
