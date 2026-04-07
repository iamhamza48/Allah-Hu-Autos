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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Plus, Pencil, Trash2, Search, ChevronRight, Folder, FolderOpen } from 'lucide-react';

interface CategoryRow {
  id: string; name: string; slug: string; icon: string;
  featured: boolean; parent_id: string | null; sort_order?: number; created_at: string;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [hasParentIdCol, setHasParentIdCol] = useState(false);
  const [form, setForm] = useState({ name:'', slug:'', icon:'', featured:false, parent_id:null as string|null, sort_order:0 });

  const fetchCats = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('sort_order').order('name');
    if (error) { toast.error('Failed to load: ' + error.message); return; }
    setCategories(data || []);
    setHasParentIdCol(data ? 'parent_id' in (data[0] ?? {}) : false);
  };

  useEffect(() => { fetchCats(); }, []);

  const topLevel = useMemo(() => categories.filter(c => !c.parent_id), [categories]);

  const displayed = useMemo(() => {
    let list = [...categories];
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(c => c.name.toLowerCase().includes(q) || c.slug.includes(q)); }
    if (filterType === 'parent') list = list.filter(c => !c.parent_id);
    if (filterType === 'sub') list = list.filter(c => !!c.parent_id);
    if (filterType === 'featured') list = list.filter(c => c.featured);
    return list;
  }, [categories, search, filterType]);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    const payload: any = { name:form.name, slug, icon:form.icon, featured:form.featured, sort_order:form.sort_order };
    if (hasParentIdCol) payload.parent_id = form.parent_id || null;

    if (editing) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editing.id);
      if (error) { toast.error('Failed: ' + error.message); return; }
      toast.success('Category updated');
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) { toast.error('Failed: ' + error.message); return; }
      toast.success('Category created');
    }
    setDialogOpen(false); fetchCats();
  };

  const handleDelete = async (id: string) => {
    const hasChildren = categories.some(c => c.parent_id === id);
    const msg = hasChildren ? 'This has subcategories. They will become unlinked. Delete anyway?' : 'Delete this category?';
    if (!confirm(msg)) return;
    await supabase.from('categories').delete().eq('id', id);
    toast.success('Deleted'); fetchCats();
  };

  const openCreate = (parentId?: string) => {
    setEditing(null);
    setForm({ name:'', slug:'', icon:'', featured:false, parent_id:parentId||null, sort_order:0 });
    setDialogOpen(true);
  };

  const openEdit = (c: CategoryRow) => {
    setEditing(c);
    setForm({ name:c.name, slug:c.slug, icon:c.icon, featured:c.featured, parent_id:c.parent_id, sort_order:c.sort_order||0 });
    setDialogOpen(true);
  };

  const parentRows = displayed.filter(c => !c.parent_id);
  const subRows = displayed.filter(c => !!c.parent_id);

  return (
    <div>
      <AdminPageHeader
        title={`Categories (${displayed.length}${displayed.length !== categories.length ? ` of ${categories.length}` : ''})`}
        subtitle={!hasParentIdCol ? '⚠ Run migration_add_parent_id.sql in Supabase to enable subcategories' : 'Manage product categories and hierarchy'}
        action={<Button size="sm" className="h-8 text-xs" onClick={() => openCreate()}><Plus className="h-3.5 w-3.5 mr-1.5" /> Add Category</Button>}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories…"  className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="parent">Main only</SelectItem>
            <SelectItem value="sub">Subcategories only</SelectItem>
            <SelectItem value="featured">Featured only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Category</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="mt-1" placeholder="e.g. LED Lighting" /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({...form,slug:e.target.value})} placeholder="auto-generated" className="mt-1" /></div>
            <div><Label>Icon (emoji)</Label><Input value={form.icon} onChange={e => setForm({...form,icon:e.target.value})} className="mt-1" placeholder="💡" /></div>
            <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={e => setForm({...form,sort_order:parseInt(e.target.value)||0})} className="mt-1" /></div>
            {hasParentIdCol && (
              <div>
                <Label>Parent Category</Label>
                <Select value={form.parent_id || '__none__'} onValueChange={v => setForm({...form, parent_id: v === '__none__' ? null : v})}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="None (main category)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__"><span className="flex items-center gap-2"><Folder className="h-4 w-4" /> None — main category</span></SelectItem>
                    {topLevel.filter(c => c.id !== editing?.id).map(c => (
                      <SelectItem key={c.id} value={c.id}><span className="flex items-center gap-2"><FolderOpen className="h-4 w-4 text-orange-500" />{c.icon} {c.name}</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Subcategories appear in the nav mega-menu under their parent.</p>
              </div>
            )}
            <div className="flex items-center gap-2"><Switch checked={form.featured} onCheckedChange={v => setForm({...form,featured:v})} /><Label>Featured on homepage</Label></div>
            <Button onClick={handleSave} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {displayed.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg border-dashed"><p className="font-medium">No categories found</p></div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Icon</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Name</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Slug</TableHead>
                {hasParentIdCol && <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Type</TableHead>}
                <TableHead className="w-16">Order</TableHead>
                <TableHead className="w-20">Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hasParentIdCol ? (
                parentRows.map(parent => {
                  const subs = subRows.filter(s => s.parent_id === parent.id);
                  return (
                    <>
                      <TableRow className="hover:bg-zinc-50/60 bg-muted/30 font-medium" key={parent.id}>
                        <TableCell className="text-xl">{parent.icon}</TableCell>
                        <TableCell className="font-semibold">{parent.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono">{parent.slug}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">Main</Badge></TableCell>
                        <TableCell className="text-muted-foreground text-xs">{parent.sort_order}</TableCell>
                        <TableCell>{parent.featured ? '⭐' : '—'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-xs h-7 px-2 mr-1 text-muted-foreground" onClick={() => openCreate(parent.id)}><Plus className="h-3 w-3 mr-1" />Sub</Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(parent)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(parent.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                      {subs.map(sub => (
                        <TableRow className="hover:bg-zinc-50/60" key={sub.id}>
                          <TableCell className="text-lg pl-8">{sub.icon}</TableCell>
                          <TableCell className="pl-8"><span className="flex items-center gap-1.5 text-muted-foreground"><ChevronRight className="h-3 w-3 shrink-0" />{sub.name}</span></TableCell>
                          <TableCell className="text-muted-foreground text-xs font-mono">{sub.slug}</TableCell>
                          <TableCell><Badge variant="secondary" className="text-xs">Sub</Badge></TableCell>
                          <TableCell className="text-muted-foreground text-xs">{sub.sort_order}</TableCell>
                          <TableCell>{sub.featured ? '⭐' : '—'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(sub)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(sub.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  );
                })
              ) : (
                displayed.map(c => (
                  <TableRow className="hover:bg-zinc-50/60" key={c.id}>
                    <TableCell className="text-xl">{c.icon}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs font-mono">{c.slug}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{c.sort_order ?? 0}</TableCell>
                    <TableCell>{c.featured ? '⭐' : '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default AdminCategories;