import type { Category, Product } from '@/types/database';

export const HIDDEN_STORE_CATEGORY_SLUGS = new Set(['protection', 'body-parts']);
export const SERVICES_CATEGORY_SLUG = 'car-modification-styling';

export const isPublicStoreCategory = (category: Pick<Category, 'slug'>) =>
  !HIDDEN_STORE_CATEGORY_SLUGS.has(category.slug) && category.slug !== SERVICES_CATEGORY_SLUG;

export const isPublicStoreProduct = (product: Product) =>
  !product.category || (
    !HIDDEN_STORE_CATEGORY_SLUGS.has(product.category.slug) &&
    product.category.slug !== SERVICES_CATEGORY_SLUG
  );
