import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/stores/cart';
import { DELIVERY_CHARGE, formatPKR, getPlaceholderImage, getVariantMaximumPrice } from '@/lib/format';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import SEO from '@/components/SEO';

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const minimumTotal = getTotal();
  const maximumTotal = items.reduce((total, item) => (
    total + (getVariantMaximumPrice(item.variant) ?? item.variant?.price ?? 0) * item.quantity
  ), 0);
  const hasEstimatedPrice = maximumTotal > minimumTotal;
  const formatRange = (minimum: number, maximum: number) => (
    maximum > minimum ? `${formatPKR(minimum)} – ${formatPKR(maximum)}` : formatPKR(minimum)
  );

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <SEO title="Shopping Cart" description="Review your Allah-Hu-Autos shopping cart." canonicalPath="/cart" noindex />
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some accessories to get started!</p>
        <Link to="/categories">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <SEO title="Shopping Cart" description="Review your Allah-Hu-Autos shopping cart." canonicalPath="/cart" noindex />
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={`${item.variantId}-${item.installType || 'none'}`}>
              <CardContent className="p-4 flex gap-4">
                <img
                  src={item.product?.images?.[0]?.url || getPlaceholderImage(item.product?.name || 'Product')}
                  alt={item.product?.name}
                  width="80"
                  height="80"
                  className="h-20 w-20 rounded-md object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{item.product?.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.variant?.name}</p>
                  {item.installType && (
                    <p className="text-xs text-primary capitalize">{item.installType} install</p>
                  )}
                  {item.product?.installable && !item.installType && (
                    <Link to={`/product/${item.product.slug}`} className="text-xs font-semibold text-destructive hover:underline">
                      Choose installation option
                    </Link>
                  )}
                  <p className="font-bold text-primary mt-1">
                    {formatRange(item.variant?.price ?? 0, getVariantMaximumPrice(item.variant) ?? item.variant?.price ?? 0)}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.variantId, item.installType)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <div className="flex items-center border rounded-md">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.variantId, item.quantity - 1, item.installType)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.variantId, item.quantity + 1, item.installType)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
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
                <span>{formatRange(minimumTotal, maximumTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery charges</span>
                <span className="font-semibold text-emerald-600">{formatPKR(DELIVERY_CHARGE)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 text-lg font-bold">
                <span>{hasEstimatedPrice ? 'Estimated total' : 'Total'}</span>
                <span className="text-primary">{formatRange(minimumTotal + DELIVERY_CHARGE, maximumTotal + DELIVERY_CHARGE)}</span>
              </div>
              {hasEstimatedPrice && <p className="text-xs text-muted-foreground">Final price will be confirmed after your order is placed.</p>}
            </div>
            <Link to="/checkout">
              <Button className="w-full mt-4" size="lg">Proceed to Checkout</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cart;
