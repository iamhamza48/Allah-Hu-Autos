import type { Product, ProductVariant } from '@/types/database';

export const DELIVERY_CHARGE = 0;

export function formatPKR(amount: number): string {
  return `Rs ${amount.toLocaleString('en-PK')}`;
}

export function getVariantMaximumPrice(variant?: ProductVariant | null): number | null {
  const value = variant?.attributes?.price_max;
  const maximum = typeof value === 'number' ? value : Number(value);
  return variant && Number.isFinite(maximum) && maximum > variant.price ? maximum : null;
}

export function formatProductPrice(product: Product): string {
  const maximum = product.variants?.reduce<number | null>((current, variant) => {
    const candidate = getVariantMaximumPrice(variant);
    return candidate && (!current || candidate > current) ? candidate : current;
  }, null);
  return maximum ? `${formatPKR(product.base_price)} – ${formatPKR(maximum)}` : formatPKR(product.base_price);
}

export function getPlaceholderImage(name: string, index = 0): string {
  const colors = [
    'e11d48', '7c3aed', '2563eb', '059669', 'd97706',
    'dc2626', '4f46e5', '0891b2', '65a30d', 'c026d3',
  ];
  const color = colors[index % colors.length];
  const encodedName = encodeURIComponent(name);
  return `https://placehold.co/600x400/${color}/white?text=${encodedName}`;
}

export function getDiscountPercent(price: number, comparePrice: number | null): number | null {
  if (!comparePrice || comparePrice <= price) return null;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}
