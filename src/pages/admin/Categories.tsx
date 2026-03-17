import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Category } from '@/types/database';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, ArrowUpDown } from 'lucide-react';

type SortKey = 'name' | 'created_at';
type SortDir = 'asc' | 'desc';

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: '', featured: false });

  const fetchCats = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  };
  useEffect(() => { fetchCats(); }, []);

  const displayed = useMemo(() => {
    let list = [...categories];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
    }
    if (filterFeatured === 'featured') list = list.filter(c => c.featured);
    if (filterFeatured === 'not-featured') list = list.filter(c => !c.featured);
    list.sort((a, b) => {
      const av = sortKey === 'name' ? a.name : a.created_at;
      const bv = sortKey === 'name' ? b.name : b.created_at;
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [categories, search, filterFeatured, sortKey, sortDir]);

  const handleSave = async () => {
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (editing) {
      const { error } = await supabase.from('categories').update({ ...form, slug }).eq('id', editing.id);
      if (error) { toast.error('Failed: ' + error.message); return; }
      toast.success('Category updated');
    } else {
      const { error } = await supabase.from('categories').insert({ ...form, slug });
      if (error) { toast.error('Failed: ' + error.message); return; }
      toast.success('Category created');
    }
    setDialogOpen(false); fetchCats();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await supabase.from('categories').delete().eq('id', id);
    toast.success('Deleted'); fetchCats();
  };

  const openCreate = () => { setEditing(null); setForm({ name: '', slug: '', icon: '', featured: false }); setDialogOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, slug: c.slug, icon: c.icon, featured: c.featured }); setDialogOpen(true); };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    <ArrowUpDown className={`h-3 w-3 ml-1 inline ${sortKey === k ? 'text-primary' : 'text-muted-foreground'}`} />
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Categories ({displayed.length}{displayed.length !== categories.length ? ` of ${categories.length}` : ''})</h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories..." className="pl-9" />
        </div>
        <Select value={filterFeatured} onValueChange={setFilterFeatured}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="featured">Featured only</SelectItem>
            <SelectItem value="not-featured">Not featured</SelectItem>
          </SelectContent>
        </Select>
        <Select value={`${sortKey}-${sortDir}`} onValueChange={v => { const [k, d] = v.split('-'); setSortKey(k as SortKey); setSortDir(d as SortDir); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name A–Z</SelectItem>
            <SelectItem value="name-desc">Name Z–A</SelectItem>
            <SelectItem value="created_at-desc">Newest first</SelectItem>
            <SelectItem value="created_at-asc">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Category</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className="mt-1" /></div>
            <div><Label>Icon (emoji)</Label><Input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="mt-1" /></div>
            <div className="flex items-center gap-2"><Switch checked={form.featured} onCheckedChange={v => setForm({ ...form, featured: v })} /><Label>Featured on homepage</Label></div>
            <Button onClick={handleSave} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {displayed.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg border-dashed">
          <p className="font-medium">No categories found</p>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Icon</TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('name')}>Name <SortIcon k="name" /></TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="text-xl">{c.icon}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">{c.slug}</TableCell>
                  <TableCell>{c.featured ? '⭐' : '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

export default AdminCategories;
