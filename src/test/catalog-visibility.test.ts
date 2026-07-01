import { describe, expect, it } from 'vitest';
import { isPublicStoreCategory, isPublicStoreProduct } from '@/lib/catalog-visibility';

describe('public catalogue visibility', () => {
  it.each(['protection', 'body-parts', 'car-modification-styling'])(
    'hides %s from shop categories',
    slug => expect(isPublicStoreCategory({ slug } as any)).toBe(false),
  );

  it('keeps Accessories independent and visible', () => {
    expect(isPublicStoreCategory({ slug: 'car-mod-accessories' } as any)).toBe(true);
  });

  it('hides products assigned to archived service categories', () => {
    expect(isPublicStoreProduct({ category: { slug: 'protection' } } as any)).toBe(false);
    expect(isPublicStoreProduct({ category: { slug: 'body-parts' } } as any)).toBe(false);
    expect(isPublicStoreProduct({ category: { slug: 'car-mod-accessories' } } as any)).toBe(true);
  });
});
