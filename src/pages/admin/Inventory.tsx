import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Warehouse, AlertCircle, CheckCircle2, Plus, Pencil, Check, X } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

const AdminInventory = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Inline editing
  const [editId, setEditId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Add stock dialog
  const [addOpen, setAddOpen] = useState(false);
  const [allVariants, setAllVariants] = useState<any[]>([]);
  const [allBranches, setAllBranches] = useState<any[]>([]);
  const [addVariantId, setAddVariantId] = useState('');
  const [addBranchId, setAddBranchId] = useState('');
  const [addQty, setAddQty] = useState(0);
  const [adding, setAdding] = useState(false);

  const fetchInv = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('inventory')
        .select(`
          id,
          quantity,
          variant_id,
          branch_id,
          branches (name),
          product_variants (
            name,
            products (name)
          )
        `);
      if (fetchError) throw fetchError;
      setInventory(data || []);
    } catch (err: any) {
      console.error('Inventory fetch error:', err);
      const msg = err?.message || 'Failed to load inventory';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    const [{ data: vars }, { data: brs }] = await Promise.all([
      supabase.from('product_variants').select('id, name, products(name)').order('name'),
      supabase.from('branches').select('id, name').eq('is_active', true).order('name'),
    ]);
    setAllVariants(vars || []);
    setAllBranches(brs || []);
  };

  useEffect(() => { fetchInv(); fetchMeta(); }, []);

  const displayed = useMemo(() => {
    if (!search.trim()) return inventory;
    const q = search.toLowerCase();
    return inventory.filter(i => {
      const pName = i.product_variants?.products?.name?.toLowerCase() ?? '';
      const vName = i.product_variants?.name?.toLowerCase() ?? '';
      return pName.includes(q) || vName.includes(q);
    });
  }, [inventory, search]);

  const lowStock = displayed.filter(i => (i.quantity ?? 0) <= 5).length;

  // ── Inline edit ────────────────────────────────────────────────────────────
  const startEdit = (inv: any) => {
    setEditId(inv.id);
    setEditQty(inv.quantity ?? 0);
  };

  const cancelEdit = () => setEditId(null);

  const saveEdit = async (id: string) => {
    setSavingId(id);
    try {
      const { error } = await supabase.from('inventory').update({ quantity: editQty }).eq('id', id);
      if (error) throw error;
      toast.success('Stock updated');
      setEditId(null);
      await fetchInv();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingId(null);
    }
  };

  // ── Add new entry ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setAddVariantId('');
    setAddBranchId('');
    setAddQty(0);
    setAddOpen(true);
  };

  const handleAdd = async () => {
    if (!addVariantId || !addBranchId) {
      toast.error('Please select a variant and a branch');
      return;
    }
    setAdding(true);
    try {
      const { error } = await supabase
        .from('inventory')
        .upsert(
          { variant_id: addVariantId, branch_id: addBranchId, quantity: addQty },
          { onConflict: 'variant_id,branch_id' }
        );
      if (error) throw error;
      toast.success('Stock entry saved!');
      setAddOpen(false);
      await fetchInv();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title={`Inventory (${displayed.length})`}
        subtitle={
          error
            ? `⚠ ${error}`
            : lowStock > 0
            ? `${lowStock} item${lowStock !== 1 ? 's' : ''} low on stock`
            : inventory.length > 0
            ? 'All stock levels normal'
            : undefined
        }
        action={
          <Button size="sm" className="h-8 text-xs" onClick={openAdd}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Stock
          </Button>
        }
        onRefresh={fetchInv}
        refreshing={loading}
      />

      {/* ── Add Stock Dialog ─────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add / Update Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Product Variant</Label>
              <Select value={addVariantId} onValueChange={setAddVariantId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a variant…" />
                </SelectTrigger>
                <SelectContent>
                  {allVariants.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.products?.name} — {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Branch</Label>
              <Select value={addBranchId} onValueChange={setAddBranchId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a branch…" />
                </SelectTrigger>
                <SelectContent>
                  {allBranches.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                min={0}
                value={addQty}
                onChange={e => setAddQty(+e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-zinc-400 mt-1">
                If a record already exists for this variant + branch, the quantity will be overwritten.
              </p>
            </div>

            <Button className="w-full" onClick={handleAdd} disabled={adding}>
              {adding ? 'Saving…' : 'Save Stock Entry'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search product or variant…"
          className="pl-9 h-9 text-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── States ───────────────────────────────────────────────────────── */}
      {loading ? (
        <Card className="shadow-none">
          <div className="divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4">
                <div className="h-3 bg-zinc-100 rounded w-40 animate-pulse" />
                <div className="h-3 bg-zinc-100 rounded w-24 animate-pulse" />
                <div className="h-3 bg-zinc-100 rounded w-10 animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        </Card>
      ) : error ? (
        <div className="text-center py-16 border border-dashed border-destructive/30 rounded-xl bg-destructive/5">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive/50" />
          <p className="font-medium text-destructive">Failed to load inventory</p>
          <p className="text-sm text-destructive/80 mt-1 max-w-sm mx-auto">{error}</p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 border border-dashed border-zinc-200 rounded-xl bg-white">
          <Warehouse className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="font-medium text-zinc-500">
            {inventory.length === 0 ? 'No inventory records found' : 'No results match your search'}
          </p>
          {inventory.length === 0 && (
            <p className="text-sm mt-1 text-zinc-400">
              Click <strong>Add Stock</strong> above to create your first inventory entry.
            </p>
          )}
        </div>
      ) : (
        <Card className="shadow-none overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Product</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Variant</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Branch</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Qty</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.map((inv) => {
                const qty = inv.quantity ?? 0;
                const isLow = qty <= 5;
                const isEditing = editId === inv.id;
                return (
                  <TableRow key={inv.id} className="hover:bg-zinc-50/60">
                    <TableCell className="font-medium text-sm text-zinc-900">
                      {inv.product_variants?.products?.name || (
                        <span className="text-zinc-300 italic">Unknown product</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-500">
                      {inv.product_variants?.name || <span className="text-zinc-300 italic">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-700">
                      {inv.branches?.name || <span className="text-zinc-300 italic">—</span>}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          min={0}
                          value={editQty}
                          onChange={e => setEditQty(+e.target.value)}
                          className="h-7 w-20 text-sm"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveEdit(inv.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                      ) : (
                        <span className={`text-sm font-bold tabular-nums ${isLow ? 'text-primary' : 'text-zinc-900'}`}>
                          {qty}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded-md">
                          <AlertCircle className="h-3 w-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="h-3 w-3" /> In Stock
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => saveEdit(inv.id)}
                            disabled={savingId === inv.id}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7"
                            onClick={cancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 text-zinc-400 hover:text-zinc-700"
                          onClick={() => startEdit(inv)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default AdminInventory;