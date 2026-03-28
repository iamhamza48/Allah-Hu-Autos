import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Search, RefreshCw } from 'lucide-react';

const AdminInventory = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchInv = async () => {
    try {
      setLoading(true);
      // Using standard plural names (branches/product_variants) to avoid 406 error
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          id,
          quantity,
          branches (name),
          product_variants (
            name,
            products (name)
          )
        `);

      if (error) throw error;
      setInventory(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInv(); }, []);

  const displayed = useMemo(() => {
    return inventory.filter(i => {
      const q = search.toLowerCase();
      const pName = i.product_variants?.products?.name?.toLowerCase() || "";
      const vName = i.product_variants?.name?.toLowerCase() || "";
      return pName.includes(q) || vName.includes(q);
    });
  }, [inventory, search]);

  if (loading) return <div className="p-10 animate-pulse bg-zinc-50 rounded-xl">Loading Inventory...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Inventory Management</h2>
        <Button variant="outline" size="sm" onClick={fetchInv}><RefreshCw className="h-4 w-4 mr-2"/> Refresh</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input placeholder="Search..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="border-zinc-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayed.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>
                  <div className="font-bold">{inv.product_variants?.products?.name || "Product"}</div>
                  <div className="text-xs text-zinc-500">{inv.product_variants?.name}</div>
                </TableCell>
                <TableCell className="font-medium">{inv.branches?.name}</TableCell>
                <TableCell className="font-bold">{inv.quantity}</TableCell>
                <TableCell>
                  {inv.quantity <= 5 ? (
                    <Badge variant="outline" className="border-orange-500 text-orange-600">Low Stock</Badge>
                  ) : (
                    <Badge variant="outline" className="border-green-500 text-green-600">In Stock</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminInventory;