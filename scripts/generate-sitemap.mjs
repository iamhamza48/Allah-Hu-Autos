import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SITE_URL = process.env.SEO_SITE_URL?.replace(/\/$/, '');
const HIDDEN_CATEGORY_SLUGS = new Set(['protection', 'body-parts', 'car-modification-styling']);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL/key in .env.local');
}

if (!SITE_URL) {
  throw new Error('Set SEO_SITE_URL only after the domain is connected to this website');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const escapeXml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const today = new Date().toISOString().slice(0, 10);

const addUrl = (urls, path, priority, changefreq = 'weekly', lastmod = today) => {
  urls.push({
    loc: `${SITE_URL}${path}`,
    priority,
    changefreq,
    lastmod,
  });
};

const { data: categories, error: categoryError } = await supabase
  .from('categories')
  .select('slug,created_at')
  .order('name');

if (categoryError) throw categoryError;

const { data: products, error: productError } = await supabase
  .from('products')
  .select('slug,updated_at,created_at,category:categories(slug)')
  .order('name');

if (productError) throw productError;

const serviceProducts = (products || [])
  .filter(product => product.slug?.startsWith('service-'))
  .map(product => product.slug.replace(/^service-/, ''));

const urls = [];
addUrl(urls, '/', '1.0', 'daily');
addUrl(urls, '/products', '0.9', 'daily');
addUrl(urls, '/categories', '0.8', 'weekly');
addUrl(urls, '/car-modification', '0.8', 'weekly');
addUrl(urls, '/booking', '0.7', 'monthly');
addUrl(urls, '/about', '0.6', 'monthly');

(categories || [])
  .filter(category => category.slug && !HIDDEN_CATEGORY_SLUGS.has(category.slug))
  .forEach(category => {
    addUrl(urls, `/category/${category.slug}`, '0.75', 'weekly', (category.created_at || today).slice(0, 10));
  });

(products || [])
  .filter(product => (
    product.slug &&
    !product.slug.startsWith('service-') &&
    !HIDDEN_CATEGORY_SLUGS.has(product.category?.slug)
  ))
  .forEach(product => {
    addUrl(urls, `/product/${product.slug}`, '0.7', 'weekly', (product.updated_at || product.created_at || today).slice(0, 10));
  });

serviceProducts.forEach(serviceId => {
  addUrl(urls, `/car-modification/${serviceId}`, '0.7', 'monthly');
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

writeFileSync(resolve('public/sitemap.xml'), xml, 'utf8');
console.log(`Generated ${urls.length} sitemap URLs for ${SITE_URL}`);
