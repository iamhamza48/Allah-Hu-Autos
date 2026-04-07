import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { formatPKR } from '@/lib/format';
import { Package, ShoppingBag, Users, TrendingUp, Calendar, Clock } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0, orders: 0, customers: 0, revenue: 0,
    bookings: 0, pendingOrders: 0, pendingBookings: 0,
  });
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
      supabase.from('orders').select('id, total, status, created_at, user_id, shipping_city').order('created_at', { ascending: false }).limit(6),
      supabase.from('bookings').select('id, status, booking_date, booking_time, branch:branches(name), user_id').order('created_at', { ascending: false }).limit(6),
    ]);

    const allOrders = orders.data || [];
    const allBookings = bookings.data || [];

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
    {
      icon: TrendingUp,
      label: 'Total Revenue',
      value: formatPKR(stats.revenue),
      iconClass: 'text-orange-500',
      accent: 'border-l-orange-500',
      wide: true,
    },
    {
      icon: ShoppingBag,
      label: 'Orders',
      value: stats.orders,
      iconClass: 'text-blue-500',
      accent: 'border-l-blue-500',
      note: stats.pendingOrders > 0 ? `${stats.pendingOrders} pending` : undefined,
    },
    {
      icon: Calendar,
      label: 'Bookings',
      value: stats.bookings,
      iconClass: 'text-violet-500',
      accent: 'border-l-violet-500',
      note: stats.pendingBookings > 0 ? `${stats.pendingBookings} pending` : undefined,
    },
    {
      icon: Package,
      label: 'Products',
      value: stats.products,
      iconClass: 'text-emerald-500',
      accent: 'border-l-emerald-500',
    },
    {
      icon: Users,
      label: 'Customers',
      value: stats.customers,
      iconClass: 'text-zinc-500',
      accent: 'border-l-zinc-400',
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Overview of your store"
        onRefresh={fetchAll}
        refreshing={loading}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ icon: Icon, label, value, iconClass, accent, note, wide }) => (
          <Card key={label} className={`border-l-4 ${accent} ${wide ? 'col-span-2 lg:col-span-4' : ''} shadow-none`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-2xl font-bold text-zinc-900 mt-0.5">
                    {loading ? <span className="text-zinc-300">—</span> : value}
                  </p>
                  {note && <p className="text-[11px] text-amber-600 font-semibold mt-0.5">{note}</p>}
                </div>
                <Icon className={`h-8 w-8 ${iconClass} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent orders */}
        <Card className="shadow-none">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-zinc-100">
            <ShoppingBag className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-zinc-900">Recent Orders</h3>
          </div>
          <div className="divide-y divide-zinc-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-4 py-3 flex justify-between">
                  <div className="h-3.5 bg-zinc-100 rounded w-28 animate-pulse" />
                  <div className="h-3.5 bg-zinc-100 rounded w-16 animate-pulse" />
                </div>
              ))
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No orders yet</p>
            ) : (
              recentOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{o.profile?.full_name || 'Unknown'}</p>
                    <p className="text-[11px] text-zinc-400">{o.shipping_city} · {new Date(o.created_at).toLocaleDateString('en-PK')}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-sm font-semibold text-zinc-900">{formatPKR(o.total)}</p>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent bookings */}
        <Card className="shadow-none">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-zinc-100">
            <Calendar className="h-4 w-4 text-violet-500" />
            <h3 className="text-sm font-semibold text-zinc-900">Recent Bookings</h3>
          </div>
          <div className="divide-y divide-zinc-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-4 py-3 flex justify-between">
                  <div className="h-3.5 bg-zinc-100 rounded w-28 animate-pulse" />
                  <div className="h-3.5 bg-zinc-100 rounded w-16 animate-pulse" />
                </div>
              ))
            ) : recentBookings.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No bookings yet</p>
            ) : (
              recentBookings.map(b => (
                <div key={b.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{b.profile?.full_name || 'Unknown'}</p>
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />{b.booking_date} at {b.booking_time}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-[11px] text-zinc-400">{b.branch?.name || '—'}</p>
                    <StatusBadge status={b.status} type="booking" />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;