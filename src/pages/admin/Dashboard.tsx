import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { formatPKR } from '@/lib/format';
import { Package, ShoppingBag, Users, TrendingUp, Calendar, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0, bookings: 0, pendingOrders: 0, pendingBookings: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    const [products, orders, customers, revenue, bookings, recentO, recentB] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id, status', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('total'),
      supabase.from('bookings').select('id, status', { count: 'exact' }),
      supabase.from('orders').select('id, total, status, created_at, user_id, shipping_city').order('created_at', { ascending: false }).limit(5),
      supabase.from('bookings').select('id, status, booking_date, booking_time, branch:branches(name), user_id').order('created_at', { ascending: false }).limit(5),
    ]);

    const allOrders = orders.data || [];
    const allBookings = bookings.data || [];

    // Fetch profiles for recent items
    const userIds = [...new Set([
      ...(recentO.data || []).map((o: any) => o.user_id),
      ...(recentB.data || []).map((b: any) => b.user_id),
    ])];
    let profileMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
      (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });
    }

    setStats({
      products: products.count || 0,
      orders: orders.count || 0,
      customers: customers.count || 0,
      revenue: (revenue.data || []).reduce((s: number, o: any) => s + (o.total || 0), 0),
      bookings: bookings.count || 0,
      pendingOrders: allOrders.filter((o: any) => o.status === 'pending').length,
      pendingBookings: allBookings.filter((b: any) => b.status === 'pending').length,
    });

    setRecentOrders((recentO.data || []).map((o: any) => ({ ...o, profile: profileMap[o.user_id] })));
    setRecentBookings((recentB.data || []).map((b: any) => ({ ...b, profile: profileMap[b.user_id] })));
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const statCards = [
    { icon: Package,    label: 'Products',       value: stats.products,               color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' },
    { icon: ShoppingBag,label: 'Orders',          value: stats.orders,                 color: 'text-blue-500',   bg: 'bg-blue-50 border-blue-200',   note: stats.pendingOrders > 0 ? `${stats.pendingOrders} pending` : undefined },
    { icon: Calendar,   label: 'Bookings',        value: stats.bookings,               color: 'text-purple-500', bg: 'bg-purple-50 border-purple-200', note: stats.pendingBookings > 0 ? `${stats.pendingBookings} pending` : undefined },
    { icon: Users,      label: 'Customers',       value: stats.customers,              color: 'text-green-500',  bg: 'bg-green-50 border-green-200' },
    { icon: TrendingUp, label: 'Total Revenue',   value: formatPKR(stats.revenue),    color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200', wide: true },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ icon: Icon, label, value, color, bg, note, wide }) => (
          <Card key={label} className={`border ${bg} ${wide ? 'col-span-2 lg:col-span-4' : ''}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold mt-0.5">{loading ? '—' : value}</p>
                  {note && <p className="text-xs text-yellow-600 font-medium mt-0.5">{note}</p>}
                </div>
                <Icon className={`h-9 w-9 ${color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="h-4 w-4 text-blue-500" />
              <h3 className="font-semibold text-sm">Recent Orders</h3>
            </div>
            {loading ? <div className="h-32 bg-secondary animate-pulse rounded" /> :
             recentOrders.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No orders yet</p> : (
              <div className="space-y-2">
                {recentOrders.map(o => (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{o.profile?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{o.shipping_city} · {new Date(o.created_at).toLocaleDateString('en-PK')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-orange-500">{formatPKR(o.total)}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium capitalize ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : o.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'}`}>{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent bookings */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-purple-500" />
              <h3 className="font-semibold text-sm">Recent Bookings</h3>
            </div>
            {loading ? <div className="h-32 bg-secondary animate-pulse rounded" /> :
             recentBookings.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No bookings yet</p> : (
              <div className="space-y-2">
                {recentBookings.map(b => (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{b.profile?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />{b.booking_date} at {b.booking_time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{b.branch?.name || '—'}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium capitalize ${b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : b.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;