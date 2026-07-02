import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCartStore } from '@/stores/cart';
import { DELIVERY_CHARGE, formatPKR, getVariantMaximumPrice } from '@/lib/format';
import { notifyOrderViaWhatsApp } from '@/lib/whatsapp';
import { toast } from 'sonner';
import type { CartItem } from '@/types/database';
import {
  normalizePakistaniMobile,
  PAKISTANI_PHONE_EXAMPLE,
  validateGuestDetails,
  type GuestDetailErrors,
} from '@/lib/customer-validation';
import SEO from '@/components/SEO';

interface CreatedOrderItem {
  variant_id: string;
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
  booking_id?: string;
}

interface BranchOption {
  id: string;
  name: string;
  city: string | null;
}

const INSTALLATION_TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const pakistanToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi' }).format(new Date());

const Checkout = () => {
  const { items, clearCart } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const buyNowItem = (location.state as { buyNowItem?: CartItem } | null)?.buyNowItem;
  const checkoutItems = buyNowItem ? [buyNowItem] : items;
  const checkoutTotal = checkoutItems.reduce(
    (total, item) => total + (item.variant?.price ?? 0) * item.quantity,
    0,
  );
  const checkoutMaximumTotal = checkoutItems.reduce(
    (total, item) => total + (getVariantMaximumPrice(item.variant) ?? item.variant?.price ?? 0) * item.quantity,
    0,
  );
  const hasEstimatedPrice = checkoutMaximumTotal > checkoutTotal;
  const formatRange = (minimum: number, maximum: number) => (
    maximum > minimum ? `${formatPKR(minimum)} – ${formatPKR(maximum)}` : formatPKR(minimum)
  );
  const requiresProfessionalInstallation = checkoutItems.some(item => item.installType === 'professional');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<GuestDetailErrors>({});
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [installationBranchId, setInstallationBranchId] = useState('');
  const [installationDate, setInstallationDate] = useState('');
  const [installationTime, setInstallationTime] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [installationNotes, setInstallationNotes] = useState('');

  useEffect(() => {
    if (!requiresProfessionalInstallation) return;
    supabase
      .from('branches')
      .select('id, name, city')
      .eq('is_active', true)
      .order('name')
      .then(({ data, error }) => {
        if (error) toast.error('Could not load installation branches');
        setBranches(data || []);
      });
  }, [requiresProfessionalInstallation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutItems.length === 0) return;
    if (checkoutItems.some(item => item.product?.installable && !item.installType)) {
      toast.error('Choose self or professional installation for every installable product');
      return;
    }
    const errors = validateGuestDetails({
      name: customerName,
      email: customerEmail,
      phone: shippingPhone,
      address: shippingAddress,
      city: shippingCity,
      notes,
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please correct the highlighted information');
      return;
    }
    if (requiresProfessionalInstallation) {
      if (!installationBranchId || !installationDate || !installationTime || vehicleInfo.trim().length < 3) {
        toast.error('Complete the installation branch, date, time, and vehicle details');
        return;
      }
      if (installationDate < pakistanToday()) {
        toast.error('Installation date cannot be in the past');
        return;
      }
    }
    const normalizedPhone = normalizePakistaniMobile(shippingPhone);
    setSubmitting(true);
    const whatsappWindow = window.open('about:blank', '_blank');

    const { data, error } = await supabase.rpc('create_guest_order_with_booking', {
      p_customer_name: customerName,
      p_customer_email: customerEmail,
      p_shipping_address: shippingAddress,
      p_shipping_city: shippingCity,
      p_shipping_phone: normalizedPhone,
      p_notes: notes,
      p_items: checkoutItems.map((item) => ({
        variant_id: item.variantId,
        quantity: item.quantity,
        install_type: item.installType,
      })),
      p_installation: requiresProfessionalInstallation ? {
        branch_id: installationBranchId,
        booking_date: installationDate,
        booking_time: installationTime,
        vehicle_info: vehicleInfo,
        notes: installationNotes,
      } : null,
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
        shippingPhone: normalizedPhone,
        shippingAddress,
        shippingCity,
        notes,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          maximumPrice: getVariantMaximumPrice(
            checkoutItems.find(checkoutItem => checkoutItem.variantId === item.variant_id)?.variant,
          ),
          installType: item.install_type,
          variantName: item.variant_name,
        })),
        total: order.total,
        maximumTotal: checkoutMaximumTotal,
        installation: requiresProfessionalInstallation ? {
          branch: branches.find(branch => branch.id === installationBranchId)?.name || 'Selected branch',
          date: installationDate,
          time: installationTime,
          vehicle: vehicleInfo,
        } : undefined,
      },
      whatsappWindow
    );

    setCompletedOrderId(order.id);
    if (!buyNowItem) clearCart();
    toast.success('Order placed! Tap Send in WhatsApp to notify us.');
    setSubmitting(false);
  };

  if (checkoutItems.length === 0 && !completedOrderId) {
    return <Navigate to="/cart" replace />;
  }

  if (completedOrderId) {
    return (
      <div className="container py-16">
        <SEO title="Order Received" description="Your Allah-Hu-Autos order confirmation." canonicalPath="/checkout" noindex />
        <Card className="mx-auto max-w-xl text-center">
          <CardContent className="p-10 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✓</div>
            <h1 className="text-3xl font-bold">Order received</h1>
            <p className="text-muted-foreground">Thank you, {customerName}. Our team will contact you on {normalizePakistaniMobile(shippingPhone)} to confirm your order.</p>
            <p className="text-sm font-mono text-muted-foreground">Order #{completedOrderId.slice(0, 8)}</p>
            {requiresProfessionalInstallation && (
              <p className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
                Installation requested for {installationDate} at {installationTime}. Our team will confirm the appointment.
              </p>
            )}
            <Button onClick={() => navigate('/products')}>Continue shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container py-8">
      <SEO title="Checkout" description="Complete your Allah-Hu-Autos order securely." canonicalPath="/checkout" noindex />
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
                    <Input value={customerName} onChange={(e) => { setCustomerName(e.target.value); setFieldErrors(old => ({ ...old, name: undefined })); }} autoComplete="name" aria-invalid={!!fieldErrors.name} required />
                    {fieldErrors.name && <p className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>}
                  </div>
                  <div>
                    <Label>Email (optional)</Label>
                    <Input type="email" value={customerEmail} onChange={(e) => { setCustomerEmail(e.target.value); setFieldErrors(old => ({ ...old, email: undefined })); }} autoComplete="email" aria-invalid={!!fieldErrors.email} />
                    {fieldErrors.email && <p className="mt-1 text-xs text-destructive">{fieldErrors.email}</p>}
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={shippingAddress} onChange={(e) => { setShippingAddress(e.target.value); setFieldErrors(old => ({ ...old, address: undefined })); }} autoComplete="street-address" aria-invalid={!!fieldErrors.address} required />
                  {fieldErrors.address && <p className="mt-1 text-xs text-destructive">{fieldErrors.address}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input value={shippingCity} onChange={(e) => { setShippingCity(e.target.value); setFieldErrors(old => ({ ...old, city: undefined })); }} autoComplete="address-level2" aria-invalid={!!fieldErrors.city} required />
                    {fieldErrors.city && <p className="mt-1 text-xs text-destructive">{fieldErrors.city}</p>}
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input type="tel" value={shippingPhone} onChange={(e) => { setShippingPhone(e.target.value); setFieldErrors(old => ({ ...old, phone: undefined })); }} autoComplete="tel" placeholder="03000000000" aria-invalid={!!fieldErrors.phone} required />
                    <p className={`mt-1 text-xs ${fieldErrors.phone ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {fieldErrors.phone || `Accepted: ${PAKISTANI_PHONE_EXAMPLE}`}
                    </p>
                  </div>
                </div>
                <div>
                  <Label>Notes (optional)</Label>
                  <Textarea value={notes} maxLength={1000} onChange={(e) => { setNotes(e.target.value); setFieldErrors(old => ({ ...old, notes: undefined })); }} aria-invalid={!!fieldErrors.notes} />
                </div>
              </CardContent>
            </Card>

            {requiresProfessionalInstallation && (
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle>Professional Installation Appointment</CardTitle>
                  <p className="text-sm text-muted-foreground">Schedule one appointment for all professionally installed items in this order.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Installation Branch</Label>
                    <select
                      value={installationBranchId}
                      onChange={event => setInstallationBranchId(event.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Select a branch</option>
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>{branch.name}{branch.city ? ` — ${branch.city}` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Preferred Date</Label>
                      <Input type="date" min={pakistanToday()} value={installationDate} onChange={event => setInstallationDate(event.target.value)} required />
                    </div>
                    <div>
                      <Label>Preferred Time</Label>
                      <select
                        value={installationTime}
                        onChange={event => setInstallationTime(event.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Select a time</option>
                        {INSTALLATION_TIMES.map(time => <option key={time} value={time}>{time}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>Vehicle Make, Model & Year</Label>
                    <Input value={vehicleInfo} onChange={event => setVehicleInfo(event.target.value)} placeholder="e.g. Toyota Corolla 2022" maxLength={200} required />
                  </div>
                  <div>
                    <Label>Installation Notes (optional)</Label>
                    <Textarea value={installationNotes} onChange={event => setInstallationNotes(event.target.value)} maxLength={500} placeholder="Any fitment details or special requests" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="h-fit">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                {checkoutItems.map((item) => (
                  <div key={`${item.variantId}-${item.installType || 'none'}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-2">
                      {item.product?.name} × {item.quantity}
                    </span>
                    <span>{formatRange(
                      (item.variant?.price ?? 0) * item.quantity,
                      (getVariantMaximumPrice(item.variant) ?? item.variant?.price ?? 0) * item.quantity,
                    )}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{hasEstimatedPrice ? 'Estimated subtotal' : 'Subtotal'}</span>
                  <span>{formatRange(checkoutTotal, checkoutMaximumTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery charges</span>
                  <span className="font-semibold text-emerald-600">{formatPKR(DELIVERY_CHARGE)}</span>
                </div>
                <div className="flex justify-between border-t pt-3 text-lg font-bold">
                  <span>{hasEstimatedPrice ? 'Estimated total' : 'Total'}</span>
                  <span className="text-primary">{formatRange(checkoutTotal + DELIVERY_CHARGE, checkoutMaximumTotal + DELIVERY_CHARGE)}</span>
                </div>
                {hasEstimatedPrice && <p className="text-xs font-normal text-muted-foreground">Final price will be confirmed after your order is placed.</p>}
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
