import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { formatPKR } from '@/lib/format';
import { Package, ShoppingBag, Users, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [p, o, c, r] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total'),
      ]);
      setStats({
        products: p.count || 0,
        orders: o.count || 0,
        customers: c.count || 0,
        revenue: r.data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0,
      });
    };
    fetch();
  }, []);

  const cards = [
    { icon: Package, label: 'Products', value: stats.products, color: 'text-primary' },
    { icon: ShoppingBag, label: 'Orders', value: stats.orders, color: 'text-success' },
    { icon: Users, label: 'Customers', value: stats.customers, color: 'text-warning' },
    { icon: DollarSign, label: 'Revenue', value: formatPKR(stats.revenue), color: 'text-primary' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
                <Icon className={`h-8 w-8 ${color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
