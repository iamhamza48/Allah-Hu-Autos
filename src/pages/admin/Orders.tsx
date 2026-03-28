import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatPKR } from '@/lib/format';
import { toast } from 'sonner';
import { Search, RefreshCw, Eye, ShoppingBag, MapPin, Phone } from 'lucide-react';

const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled'];

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800 border border-yellow-300',
  confirmed:  'bg-blue-100 text-blue-800 border border-blue-300',
  processing: 'bg-purple-100 text-purple-800 border border-purple-300',
  shipped:    'bg-indigo-100 text-indigo-800 border border-indigo-300',
  delivered:  'bg-green-100 text-green-800 border border-green-300',
  cancelled:  'bg-red-100 text-red-800 border border-red-300',
};

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
    // Fetch profiles separately
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Orders ({displayed.length}{displayed.length !== orders.length ? ` of ${orders.length}` : ''})</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Total shown: {formatPKR(revenue)}</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer, order ID, city..." className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="h-40 bg-secondary animate-pulse rounded-lg" />
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg border-dashed">
          <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="font-medium">No orders found</p>
          <p className="text-sm mt-1">Orders will appear here once customers check out</p>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">#{o.id.slice(0,8)}</TableCell>
                  <TableCell>
                    <p className="font-medium text-sm">{o.profile?.full_name || 'Unknown'}</p>
                    {o.profile?.phone && <p className="text-xs text-muted-foreground">{o.profile.phone}</p>}
                  </TableCell>
                  <TableCell className="text-sm">{(o.items || []).length} item{(o.items || []).length !== 1 ? 's' : ''}</TableCell>
                  <TableCell className="font-semibold text-sm">{formatPKR(o.total)}</TableCell>
                  <TableCell className="text-sm">{o.shipping_city || '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString('en-PK')}</TableCell>
                  <TableCell>
                    <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                      <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setViewOrder(o)} title="View details">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Order detail dialog */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order #{viewOrder?.id?.slice(0,8)}</DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Customer</p>
                  <p className="font-medium">{viewOrder.profile?.full_name || 'Unknown'}</p>
                  {viewOrder.profile?.phone && <p className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" />{viewOrder.profile.phone}</p>}
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Delivery</p>
                  <p className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3 text-orange-500" />{viewOrder.shipping_city}</p>
                  {viewOrder.shipping_address && <p className="text-muted-foreground text-xs mt-0.5">{viewOrder.shipping_address}</p>}
                  {viewOrder.shipping_phone && <p className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" />{viewOrder.shipping_phone}</p>}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Items</p>
                <div className="space-y-2">
                  {(viewOrder.items || []).map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg border bg-background">
                      {item.product?.images?.[0]?.url && (
                        <img src={item.product.images[0].url} className="w-10 h-10 rounded object-cover border" alt="" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product?.name || '—'}</p>
                        {item.variant?.name && <p className="text-xs text-muted-foreground">{item.variant.name}</p>}
                        {item.install_type && <p className="text-xs text-blue-600">Install: {item.install_type}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">{formatPKR(item.price)}</p>
                        <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-orange-500 text-lg">{formatPKR(viewOrder.total)}</span>
              </div>

              {viewOrder.notes && (
                <div className="bg-secondary/50 rounded-lg p-3 text-sm">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Notes</p>
                  <p>{viewOrder.notes}</p>
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