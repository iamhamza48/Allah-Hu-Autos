import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCartStore } from '@/stores/cart';
import { formatPKR } from '@/lib/format';
import { notifyOrderViaWhatsApp } from '@/lib/whatsapp';
import { toast } from 'sonner';

interface CreatedOrderItem {
  name: string;
  variant_name: string;
  quantity: number;
  price: number;
  install_type: 'self' | 'professional' | null;
}

interface CreatedOrder {
  id: string;
  total: number;
  items: CreatedOrderItem[];
}

const Checkout = () => {
  const { items, getTotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!customerName.trim() || !shippingAddress.trim() || !shippingCity.trim() || !shippingPhone.trim()) {
      toast.error('Please complete your name, phone, and delivery details');
      return;
    }
    setSubmitting(true);
    const whatsappWindow = window.open('about:blank', '_blank');

    const { data, error } = await supabase.rpc('create_guest_order', {
      p_customer_name: customerName,
      p_customer_email: customerEmail,
      p_shipping_address: shippingAddress,
      p_shipping_city: shippingCity,
      p_shipping_phone: shippingPhone,
      p_notes: notes,
      p_items: items.map((item) => ({
        variant_id: item.variantId,
        quantity: item.quantity,
        install_type: item.installType,
      })),
    });
    const order = data as CreatedOrder | null;

    if (error || !order) {
      whatsappWindow?.close();
      toast.error(error?.message || 'Failed to place order');
      setSubmitting(false);
      return;
    }

    notifyOrderViaWhatsApp(
      {
        orderId: order.id,
        customerName,
        customerEmail,
        shippingPhone,
        shippingAddress,
        shippingCity,
        notes,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          installType: item.install_type,
          variantName: item.variant_name,
        })),
        total: order.total,
      },
      whatsappWindow
    );

    setCompletedOrderId(order.id);
    clearCart();
    toast.success('Order placed! Tap Send in WhatsApp to notify us.');
    setSubmitting(false);
  };

  if (completedOrderId) {
    return (
      <div className="container py-16">
        <Card className="mx-auto max-w-xl text-center">
          <CardContent className="p-10 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✓</div>
            <h1 className="text-3xl font-bold">Order received</h1>
            <p className="text-muted-foreground">Thank you, {customerName}. Our team will contact you on {shippingPhone} to confirm your order.</p>
            <p className="text-sm font-mono text-muted-foreground">Order #{completedOrderId.slice(0, 8)}</p>
            <Button onClick={() => navigate('/products')}>Continue shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
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
            <Card>
              <CardHeader><CardTitle>Contact & Shipping Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} autoComplete="name" required />
                  </div>
                  <div>
                    <Label>Email (optional)</Label>
                    <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} autoComplete="email" />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} autoComplete="street-address" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} autoComplete="address-level2" required />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input type="tel" value={shippingPhone} onChange={(e) => setShippingPhone(e.target.value)} autoComplete="tel" required />
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
