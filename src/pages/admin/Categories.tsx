import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Category } from '@/types/database';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: '', featured: false });

  const fetch = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-');
    if (editing) {
      await supabase.from('categories').update({ ...form, slug }).eq('id', editing.id);
      toast.success('Updated');
    } else {
      await supabase.from('categories').insert({ ...form, slug });
      toast.success('Created');
    }
    setDialogOpen(false); fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await supabase.from('categories').delete().eq('id', id);
    toast.success('Deleted'); fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Categories ({categories.length})</h2>
        <Button onClick={() => { setEditing(null); setForm({ name: '', slug: '', icon: '', featured: false }); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Category</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div><Label>Icon (emoji)</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /><Label>Featured</Label></div>
            <Button onClick={handleSave} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Icon</TableHead><TableHead>Name</TableHead><TableHead>Featured</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.icon}</TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.featured ? '⭐' : '—'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setForm({ name: c.name, slug: c.slug, icon: c.icon, featured: c.featured }); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminCategories;
