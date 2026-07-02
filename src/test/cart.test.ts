import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore } from '@/stores/cart';
import type { CartItem } from '@/types/database';

const baseItem: CartItem = {
  productId: 'product-1',
  variantId: 'variant-1',
  quantity: 1,
  installType: 'self',
};

describe('cart installation lines', () => {
  beforeEach(() => useCartStore.setState({ items: [] }));

  it('keeps self and professional installation as separate lines', () => {
    useCartStore.getState().addItem(baseItem);
    useCartStore.getState().addItem({ ...baseItem, installType: 'professional' });

    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it('updates and removes only the selected installation line', () => {
    useCartStore.getState().addItem(baseItem);
    useCartStore.getState().addItem({ ...baseItem, installType: 'professional' });
    useCartStore.getState().updateQuantity('variant-1', 3, 'professional');
    useCartStore.getState().removeItem('variant-1', 'self');

    expect(useCartStore.getState().items).toEqual([
      expect.objectContaining({ installType: 'professional', quantity: 3 }),
    ]);
  });
});
