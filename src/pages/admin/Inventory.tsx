import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Inventory } from '@/types/database';
import { toast } from 'sonner';
import { Search, ArrowUpDown } from 'lucide-react';

type SortKey = 'name' | 'quantity' | 'branch';
type SortDir = 'asc' | 'desc';

const AdminInventory = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const fetchInv = async () => {
    const { data } = await supabase
      .from('inventory')
      .select('*, variant:product_variants(*, product:products(*)), branch:branches(*)')
      .order('updated_at', { ascending: false });
    const rows = data || [];
    setInventory(rows);
    const bNames = [...new Set(rows.map((i: any) => i.branch?.name).filter(Boolean))] as string[];
    setBranches(bNames);
    setLoading(false);
  };

  useEffect(() => { fetchInv(); }, []);

  const displayed = useMemo(() => {
    let list = [...inventory];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => (i.variant as any)?.product?.name?.toLowerCase().includes(q) || i.branch?.name?.toLowerCase().includes(q));
    }
    if (filterBranch !== 'all') list = list.filter(i => i.branch?.name === filterBranch);
    if (filterStock === 'low') list = list.filter(i => i.quantity > 0 && i.quantity <= 5);
    if (filterStock === 'out') list = list.filter(i => i.quantity === 0);
    if (filterStock === 'in') list = list.filter(i => i.quantity > 5);
    list.sort((a, b) => {
      let av: any, bv: any;
      if (sortKey === 'name') { av = (a.variant as any)?.product?.name || ''; bv = (b.variant as any)?.product?.name || ''; }
      else if (sortKey === 'quantity') { av = a.quantity; bv = b.quantity; }
      else { av = a.branch?.name || ''; bv = b.branch?.name || ''; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [inventory, search, filterBranch, filterStock, sortKey, sortDir]);

  const updateQty = async (id: string, quantity: number) => {
    await supabase.from('inventory').update({ quantity }).eq('id', id);
    toast.success('Updated');
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    <ArrowUpDown className={`h-3 w-3 ml-1 inline ${sortKey === k ? 'text-primary' : 'text-muted-foreground'}`} />
  );

  const stockBadge = (qty: number) => {
    if (qty === 0) return <Badge variant="destructive">Out of stock</Badge>;
    if (qty <= 5) return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Low ({qty})</Badge>;
    return <Badge variant="outline" className="border-green-500 text-green-600">In stock ({qty})</Badge>;
  };

  if (loading) return <div className="h-40 bg-secondary animate-pulse rounded-lg" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Inventory ({displayed.length}{displayed.length !== inventory.length ? ` of ${inventory.length}` : ''})</h2>
      </div>

      {/* search + filter bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="pl-9" />
        </div>
        <Select value={filterBranch} onValueChange={setFilterBranch}>
          <SelectTrigger className="w-52"><SelectValue placeholder="All branches" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All branches</SelectItem>
            {branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStock} onValueChange={setFilterStock}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stock levels</SelectItem>
            <SelectItem value="out">Out of stock</SelectItem>
            <SelectItem value="low">Low stock (≤5)</SelectItem>
            <SelectItem value="in">In stock (&gt;5)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={`${sortKey}-${sortDir}`} onValueChange={v => { const [k, d] = v.split('-'); setSortKey(k as SortKey); setSortDir(d as SortDir); }}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Product A–Z</SelectItem>
            <SelectItem value="name-desc">Product Z–A</SelectItem>
            <SelectItem value="quantity-asc">Qty low–high</SelectItem>
            <SelectItem value="quantity-desc">Qty high–low</SelectItem>
            <SelectItem value="branch-asc">Branch A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg border-dashed">
          <p className="font-medium">No inventory found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('name')}>Product <SortIcon k="name" /></TableHead>
                <TableHead>Variant</TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('branch')}>Branch <SortIcon k="branch" /></TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('quantity')}>Quantity <SortIcon k="quantity" /></TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.map(inv => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{(inv.variant as any)?.product?.name || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{inv.variant?.name}</TableCell>
                  <TableCell>{inv.branch?.name}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      defaultValue={inv.quantity}
                      className="w-20 h-8"
                      onBlur={e => updateQty(inv.id, +e.target.value)}
                    />
                  </TableCell>
                  <TableCell>{stockBadge(inv.quantity)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default AdminInventory;
