-- Adds Polishes and Perfumes with their products/variants.
-- Idempotent: safe to run more than once without creating duplicates.

begin;

do $$
declare
  v_polishes_category_id uuid;
  v_perfumes_category_id uuid;
  v_tonyin_product_id uuid;
  v_kangroos_product_id uuid;
  v_areon_product_id uuid;
  v_sameili_product_id uuid;
begin
  insert into public.categories (name, slug, icon, featured)
  values ('Polishes', 'polishes', '🧴', false)
  on conflict (slug) do update
    set name = excluded.name
  returning id into v_polishes_category_id;

  insert into public.categories (name, slug, icon, featured)
  values ('Perfumes', 'perfumes', '🌸', false)
  on conflict (slug) do update
    set name = excluded.name
  returning id into v_perfumes_category_id;

  insert into public.products (
    name, slug, description, category_id, base_price, compare_price, installable, featured
  ) values (
    'Tonyin Polish',
    'tonyin-polish',
    'Tonyin automotive polish for restoring shine and protecting vehicle paint.',
    v_polishes_category_id,
    2500,
    null,
    false,
    false
  )
  on conflict (slug) do update
    set category_id = excluded.category_id
  returning id into v_tonyin_product_id;

  insert into public.product_variants (product_id, name, sku, price, compare_price, attributes)
  select v_tonyin_product_id, 'Default', 'TONYIN-POLISH', 2500, null, '{}'::jsonb
  where not exists (
    select 1 from public.product_variants
    where product_id = v_tonyin_product_id and lower(name) = lower('Default')
  );

  insert into public.products (
    name, slug, description, category_id, base_price, compare_price, installable, featured
  ) values (
    'Kangroos Polish',
    'kangroos-polish',
    'Kangroos automotive polish available in Hard and Cosmic variants.',
    v_polishes_category_id,
    3000,
    null,
    false,
    false
  )
  on conflict (slug) do update
    set category_id = excluded.category_id
  returning id into v_kangroos_product_id;

  insert into public.product_variants (product_id, name, sku, price, compare_price, attributes)
  select v_kangroos_product_id, variant.name, variant.sku, variant.price, null, variant.attributes
  from (values
    ('Kangroos Hard', 'KANGROOS-HARD', 3000::numeric, '{"type":"Hard"}'::jsonb),
    ('Kangroos Cosmic', 'KANGROOS-COSMIC', 3500::numeric, '{"type":"Cosmic"}'::jsonb)
  ) as variant(name, sku, price, attributes)
  where not exists (
    select 1 from public.product_variants existing
    where existing.product_id = v_kangroos_product_id
      and lower(existing.name) = lower(variant.name)
  );

  insert into public.products (
    name, slug, description, category_id, base_price, compare_price, installable, featured
  ) values (
    'Areon Gel',
    'areon-gel',
    'Areon gel car perfume available in Wish and Black Crystal fragrances.',
    v_perfumes_category_id,
    1800,
    null,
    false,
    false
  )
  on conflict (slug) do update
    set category_id = excluded.category_id
  returning id into v_areon_product_id;

  insert into public.product_variants (product_id, name, sku, price, compare_price, attributes)
  select v_areon_product_id, variant.name, variant.sku, variant.price, null, variant.attributes
  from (values
    ('Wish', 'AREON-GEL-WISH', 1800::numeric, '{"fragrance":"Wish"}'::jsonb),
    ('Black Crystal', 'AREON-GEL-BLACK-CRYSTAL', 1800::numeric, '{"fragrance":"Black Crystal"}'::jsonb)
  ) as variant(name, sku, price, attributes)
  where not exists (
    select 1 from public.product_variants existing
    where existing.product_id = v_areon_product_id
      and lower(existing.name) = lower(variant.name)
  );

  insert into public.products (
    name, slug, description, category_id, base_price, compare_price, installable, featured
  ) values (
    'Sameili Jello',
    'sameili-jello',
    'Sameili Jello car perfume for a fresh and long-lasting fragrance.',
    v_perfumes_category_id,
    1500,
    null,
    false,
    false
  )
  on conflict (slug) do update
    set category_id = excluded.category_id
  returning id into v_sameili_product_id;

  insert into public.product_variants (product_id, name, sku, price, compare_price, attributes)
  select v_sameili_product_id, 'Default', 'SAMEILI-JELLO', 1500, null, '{}'::jsonb
  where not exists (
    select 1 from public.product_variants
    where product_id = v_sameili_product_id and lower(name) = lower('Default')
  );
end
$$;

commit;

-- Optional verification result returned by the SQL Editor.
select
  c.name as category,
  p.name as product,
  pv.name as variant,
  pv.price
from public.categories c
join public.products p on p.category_id = c.id
join public.product_variants pv on pv.product_id = p.id
where c.slug in ('polishes', 'perfumes')
order by c.name, p.name, pv.name;
