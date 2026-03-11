import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCartStore } from '@/stores/cart';
import { useAuth } from '@/hooks/use-auth';
import { formatPKR } from '@/lib/format';
import { toast } from 'sonner';
import type { Address } from '@/types/database';

const Checkout = () => {
  const { user } = useAuth();
  const { items, getTotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('addresses').select('*').eq('user_id', user.id).then(({ data }) => {
      setAddresses(data || []);
      const def = data?.find((a) => a.is_default);
      if (def) {
        setSelectedAddress(def.id);
        setShippingAddress(def.address_line);
        setShippingCity(def.city);
        setShippingPhone(def.phone);
      }
    });
  }, [user]);

  const handleAddressSelect = (id: string) => {
    setSelectedAddress(id);
    const addr = addresses.find((a) => a.id === id);
    if (addr) {
      setShippingAddress(addr.address_line);
      setShippingCity(addr.city);
      setShippingPhone(addr.phone);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || items.length === 0) return;
    if (!shippingAddress || !shippingCity || !shippingPhone) {
      toast.error('Please fill in all shipping details');
      return;
    }
    setSubmitting(true);

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total: getTotal(),
        shipping_address: shippingAddress,
        shipping_city: shippingCity,
        shipping_phone: shippingPhone,
        notes,
      })
      .select()
      .single();

    if (error || !order) {
      toast.error('Failed to place order');
      setSubmitting(false);
      return;
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
      price: item.variant?.price ?? 0,
      install_type: item.installType,
    }));

    await supabase.from('order_items').insert(orderItems);
    clearCart();
    toast.success('Order placed successfully!');
    navigate('/account/orders');
    setSubmitting(false);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Saved addresses */}
            {addresses.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Saved Addresses</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleAddressSelect(addr.id)}
                      className={`w-full text-left p-3 rounded-md border transition-colors ${
                        selectedAddress === addr.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <p className="font-medium">{addr.label}</p>
                      <p className="text-sm text-muted-foreground">{addr.address_line}, {addr.city}</p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle>Shipping Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Address</Label>
                  <Input value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} required />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={shippingPhone} onChange={(e) => setShippingPhone(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <Label>Notes (optional)</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.variantId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-2">
                      {item.product?.name} × {item.quantity}
                    </span>
                    <span>{formatPKR((item.variant?.price ?? 0) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPKR(getTotal())}</span>
              </div>
              <Button type="submit" className="w-full mt-4" size="lg" disabled={submitting}>
                {submitting ? 'Placing Order...' : 'Place Order'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
