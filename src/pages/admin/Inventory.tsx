import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Inventory } from '@/types/database';
import { toast } from 'sonner';

const AdminInventory = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase
      .from('inventory')
      .select('*, variant:product_variants(*, product:products(*)), branch:branches(*)')
      .order('updated_at', { ascending: false });
    setInventory(data || []);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const updateQty = async (id: string, quantity: number) => {
    await supabase.from('inventory').update({ quantity }).eq('id', id);
    toast.success('Updated');
  };

  if (loading) return <div className="h-40 bg-secondary animate-pulse rounded-lg" />;

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Inventory</h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium">{(inv.variant as any)?.product?.name || '—'}</TableCell>
                <TableCell>{inv.variant?.name}</TableCell>
                <TableCell>{inv.branch?.name}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    defaultValue={inv.quantity}
                    className="w-20 h-8"
                    onBlur={(e) => updateQty(inv.id, +e.target.value)}
                  />
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
