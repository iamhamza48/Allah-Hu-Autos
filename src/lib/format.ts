export function formatPKR(amount: number): string {
  return `Rs ${amount.toLocaleString('en-PK')}`;
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
