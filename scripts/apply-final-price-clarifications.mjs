import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const ranges = {
  'quarter-cover-vehicle-specific': [2500, 4000],
  'air-press-txr': [5500, 12000],
  'android-frame-universal': [2000, 7000],
};

const additions = {
  'brembo-caliper-cover': [
    ['Small (S)', 1800], ['Medium (M)', 2000], ['Large (L)', 2300],
  ],
  'mats-universal-set': [['Black', 2800], ['Smoke', 4800]],
  'top-cover-universal': [
    ['S \u2014 Parachute', 2500], ['S \u2014 Fur', 5500],
    ['M \u2014 Parachute', 3000], ['M \u2014 Fur', 6500],
    ['L \u2014 Parachute', 3500], ['L \u2014 Fur', 7500],
    ['XL \u2014 Parachute', 4000], ['XL \u2014 Fur', 8500],
    ['XXL \u2014 Parachute', 4500], ['XXL \u2014 Fur', 9500],
  ],
  'parking-smd-led': [['Chip', 800], ['Gel', 400]],
};

const targetSlugs = [...Object.keys(ranges), ...Object.keys(additions)];
const { data: products, error: productError } = await supabase
  .from('products')
  .select('id, slug, base_price, product_variants(id, name, price, attributes)')
  .in('slug', targetSlugs);
if (productError) throw productError;

const bySlug = new Map(products.map((product) => [product.slug, product]));
const missing = targetSlugs.filter((slug) => !bySlug.has(slug));
if (missing.length) throw new Error(`Missing products: ${missing.join(', ')}`);

for (const [slug, [minimum, maximum]] of Object.entries(ranges)) {
  const product = bySlug.get(slug);
  const defaultVariant = product.product_variants.find((variant) => variant.name === 'Default');
  if (!defaultVariant) throw new Error(`${slug} has no Default variant`);

  const { error: productUpdateError } = await supabase
    .from('products').update({ base_price: minimum }).eq('id', product.id);
  if (productUpdateError) throw productUpdateError;

  const { error: variantUpdateError } = await supabase.from('product_variants').update({
    price: minimum,
    attributes: {
      ...(defaultVariant.attributes || {}),
      price_max: maximum,
      pricing_note: 'Final price confirmed after order',
    },
  }).eq('id', defaultVariant.id);
  if (variantUpdateError) throw variantUpdateError;
}

for (const [slug, variants] of Object.entries(additions)) {
  const product = bySlug.get(slug);
  const defaultVariant = product.product_variants.find((variant) => variant.name === 'Default');
  if (!defaultVariant) throw new Error(`${slug} has no existing Default variant to preserve`);

  for (const [name, price] of variants) {
    const existing = product.product_variants.find(
      (variant) => variant.name.trim().toLowerCase() === name.toLowerCase(),
    );
    const payload = { product_id: product.id, name, price, attributes: {} };
    const query = existing
      ? supabase.from('product_variants').update(payload).eq('id', existing.id)
      : supabase.from('product_variants').insert(payload);
    const { error } = await query;
    if (error) throw error;
  }

  const minimum = Math.min(Number(defaultVariant.price), ...variants.map(([, price]) => price));
  const { error } = await supabase.from('products').update({ base_price: minimum }).eq('id', product.id);
  if (error) throw error;
}

const { data: verified, error: verifyError } = await supabase
  .from('products')
  .select('slug, base_price, product_variants(name, price, attributes)')
  .in('slug', [...targetSlugs, 'side-shades-black', 'mats-tpe']);
if (verifyError) throw verifyError;

const verification = new Map(verified.map((product) => [product.slug, product]));
for (const [slug, [minimum, maximum]] of Object.entries(ranges)) {
  const product = verification.get(slug);
  const defaultVariant = product.product_variants.find((variant) => variant.name === 'Default');
  if (Number(product.base_price) !== minimum || Number(defaultVariant.price) !== minimum
      || Number(defaultVariant.attributes?.price_max) !== maximum) {
    throw new Error(`Range verification failed for ${slug}`);
  }
}
for (const [slug, variants] of Object.entries(additions)) {
  const product = verification.get(slug);
  if (!product.product_variants.some((variant) => variant.name === 'Default')) {
    throw new Error(`Default variant was lost for ${slug}`);
  }
  for (const [name, price] of variants) {
    const variant = product.product_variants.find((item) => item.name === name);
    if (!variant || Number(variant.price) !== price) throw new Error(`Variant verification failed: ${slug}/${name}`);
  }
}

const protectedExpected = { 'side-shades-black': 800, 'mats-tpe': 3500 };
for (const [slug, expected] of Object.entries(protectedExpected)) {
  const product = verification.get(slug);
  const defaultVariant = product?.product_variants.find((variant) => variant.name === 'Default');
  if (Number(product?.base_price) !== expected || Number(defaultVariant?.price) !== expected) {
    throw new Error(`Protected Wait product changed: ${slug}`);
  }
}

console.log(JSON.stringify({
  success: true,
  rangedProducts: Object.keys(ranges).length,
  productsWithAddedVariants: Object.keys(additions).length,
  addedVariantDefinitions: Object.values(additions).flat().length,
  protectedWaitProductsUnchanged: Object.keys(protectedExpected).length,
}));
