import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatPKR } from '@/lib/format';
import { toast } from 'sonner';
import { Search, Eye, ShoppingBag, MapPin, Phone } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewOrder, setViewOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(name, images:product_images(*)), variant:product_variants(name, price))')
      .order('created_at', { ascending: false });

    if (error) { toast.error('Failed to load orders: ' + error.message); setLoading(false); return; }

    const rows = data || [];
    const userIds = [...new Set(rows.map((o: any) => o.user_id))];
    let profileMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, phone').in('id', userIds);
      (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });
    }

    setOrders(rows.map((o: any) => ({ ...o, profile: profileMap[o.user_id] || null })));
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) { toast.error('Failed: ' + error.message); return; }
    toast.success('Status updated');
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const displayed = orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.profile?.full_name?.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.shipping_city?.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const revenue = displayed.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div>
      <AdminPageHeader
        title={`Orders (${displayed.length}${displayed.length !== orders.length ? ` of ${orders.length}` : ''})`}
        subtitle={`Total shown: ${formatPKR(revenue)}`}
        onRefresh={fetchOrders}
        refreshing={loading}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer, ID, city…" className="pl-9 h-9 text-sm" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Card className="shadow-none">
          <div className="divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="h-3 bg-zinc-100 rounded w-20 animate-pulse" />
                <div className="h-3 bg-zinc-100 rounded w-32 animate-pulse" />
                <div className="h-3 bg-zinc-100 rounded w-16 animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        </Card>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 border border-dashed border-zinc-200 rounded-xl bg-white">
          <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="font-medium text-zinc-500">No orders found</p>
          <p className="text-sm mt-1">Orders will appear here once customers check out</p>
        </div>
      ) : (
        <Card className="shadow-none overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Order</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Customer</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Phone</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Items</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Total</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">City</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Date</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.map((o) => (
                <TableRow key={o.id} className="hover:bg-zinc-50/60">
                  <TableCell className="font-mono text-[11px] text-zinc-400">#{o.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <p className="font-medium text-sm text-zinc-900">{o.profile?.full_name || 'Unknown'}</p>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-600">{o.shipping_phone || o.profile?.phone || '—'}</TableCell>
                  <TableCell className="text-sm text-zinc-600">{(o.items || []).length} item{(o.items || []).length !== 1 ? 's' : ''}</TableCell>
                  <TableCell className="font-semibold text-sm text-zinc-900">{formatPKR(o.total)}</TableCell>
                  <TableCell className="text-sm text-zinc-600">{o.shipping_city || '—'}</TableCell>
                  <TableCell className="text-[11px] text-zinc-400">{new Date(o.created_at).toLocaleDateString('en-PK')}</TableCell>
                  <TableCell>
                    <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                      <SelectTrigger className="w-32 h-7 text-xs border-zinc-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewOrder(o)}>
                      <Eye className="h-4 w-4 text-zinc-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-semibold">Order <span className="font-mono text-zinc-400">#{viewOrder?.id?.slice(0, 8)}</span></DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                  <p className="text-[10px] text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">Customer</p>
                  <p className="font-medium text-zinc-900">{viewOrder.profile?.full_name || 'Unknown'}</p>
                  {viewOrder.profile?.phone && (
                    <p className="text-zinc-500 text-xs flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" />{viewOrder.profile.phone}
                    </p>
                  )}
                </div>
                <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                  <p className="text-[10px] text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">Delivery</p>
                  <p className="font-medium text-zinc-900 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary" />{viewOrder.shipping_city}
                  </p>
                  {viewOrder.shipping_address && <p className="text-zinc-400 text-xs mt-0.5">{viewOrder.shipping_address}</p>}
                  {viewOrder.shipping_phone && (
                    <p className="text-zinc-400 text-xs flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" />{viewOrder.shipping_phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-2">Items</p>
                <div className="space-y-2">
                  {(viewOrder.items || []).map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-zinc-100 bg-white">
                      {item.product?.images?.[0]?.url && (
                        <img src={item.product.images[0].url} className="w-10 h-10 rounded-md object-cover border border-zinc-100" alt="" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">{item.product?.name || '—'}</p>
                        {item.variant?.name && <p className="text-xs text-zinc-400">{item.variant.name}</p>}
                        {item.install_type && <p className="text-xs text-blue-500">Install: {item.install_type}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-zinc-900">{formatPKR(item.price)}</p>
                        <p className="text-xs text-zinc-400">×{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                <span className="font-semibold text-zinc-700">Total</span>
                <span className="font-bold text-primary text-lg">{formatPKR(viewOrder.total)}</span>
              </div>

              {viewOrder.notes && (
                <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 text-sm">
                  <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-zinc-700">{viewOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;