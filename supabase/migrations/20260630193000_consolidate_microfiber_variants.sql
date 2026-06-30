-- Consolidate the five microfiber listings into one product with five variants.
-- Existing variant IDs are preserved, so inventory and historical order links remain intact.
-- Idempotent: safe to run more than once.

begin;

do $$
declare
  v_product_id uuid;
  v_category_id uuid;
  v_old_ids uuid[];
begin
  select id
    into v_product_id
  from public.products
  where slug = 'microfiber-cloth'
  limit 1;

  select category_id
    into v_category_id
  from public.products
  where slug in (
    'microfiber-30x40-normal',
    'microfiber-40x40-nanowool',
    'microfiber-40x40-thick',
    'microfiber-40x60-quickdry',
    'microfiber-40x80-normal'
  )
  order by case when slug = 'microfiber-30x40-normal' then 0 else 1 end
  limit 1;

  if v_product_id is null then
    -- Reuse the 30x40 product as the canonical record where possible.
    select id
      into v_product_id
    from public.products
    where slug = 'microfiber-30x40-normal'
    limit 1;

    if v_product_id is not null then
      update public.products
      set name = 'Microfiber Cloth',
          slug = 'microfiber-cloth',
          description = 'Keep your vehicle clean and beautifully finished with a versatile microfiber cloth designed for automotive care. Choose from multiple sizes and textures for routine wiping, drying and detailing on suitable surfaces.',
          installable = false,
          updated_at = now()
      where id = v_product_id;
    else
      insert into public.products (
        name, slug, description, category_id, base_price, compare_price,
        installable, featured
      ) values (
        'Microfiber Cloth',
        'microfiber-cloth',
        'Keep your vehicle clean and beautifully finished with a versatile microfiber cloth designed for automotive care. Choose from multiple sizes and textures for routine wiping, drying and detailing on suitable surfaces.',
        v_category_id,
        0,
        null,
        false,
        false
      )
      returning id into v_product_id;
    end if;
  end if;

  select coalesce(array_agg(id), array[]::uuid[])
    into v_old_ids
  from public.products
  where slug in (
    'microfiber-30x40-normal',
    'microfiber-40x40-nanowool',
    'microfiber-40x40-thick',
    'microfiber-40x60-quickdry',
    'microfiber-40x80-normal'
  )
  and id <> v_product_id;

  -- Give each retained variant a customer-friendly label before moving it.
  update public.product_variants pv
  set name = case p.slug
        when 'microfiber-30x40-normal' then '30 × 40 cm — Normal'
        when 'microfiber-40x40-nanowool' then '40 × 40 cm — Nanowool'
        when 'microfiber-40x40-thick' then '40 × 40 cm — Thick'
        when 'microfiber-40x60-quickdry' then '40 × 60 cm — Quick Dry'
        when 'microfiber-40x80-normal' then '40 × 80 cm — Normal'
      end,
      attributes = coalesce(pv.attributes, '{}'::jsonb) ||
        case p.slug
          when 'microfiber-30x40-normal' then '{"size":"30 × 40 cm","type":"Normal"}'::jsonb
          when 'microfiber-40x40-nanowool' then '{"size":"40 × 40 cm","type":"Nanowool"}'::jsonb
          when 'microfiber-40x40-thick' then '{"size":"40 × 40 cm","type":"Thick"}'::jsonb
          when 'microfiber-40x60-quickdry' then '{"size":"40 × 60 cm","type":"Quick Dry"}'::jsonb
          when 'microfiber-40x80-normal' then '{"size":"40 × 80 cm","type":"Normal"}'::jsonb
        end
  from public.products p
  where pv.product_id = p.id
    and p.slug in (
      'microfiber-30x40-normal',
      'microfiber-40x40-nanowool',
      'microfiber-40x40-thick',
      'microfiber-40x60-quickdry',
      'microfiber-40x80-normal'
    );

  -- The canonical product's original variants also need the 30x40 label.
  update public.product_variants
  set name = '30 × 40 cm — Normal',
      attributes = coalesce(attributes, '{}'::jsonb) ||
        '{"size":"30 × 40 cm","type":"Normal"}'::jsonb
  where product_id = v_product_id
    and name in ('Default', 'Standard', 'Microfiber 30x40 Normal');

  -- Preserve product references on previous orders and bookings.
  update public.order_items
  set product_id = v_product_id
  where product_id = any(v_old_ids);

  update public.bookings
  set product_id = v_product_id
  where product_id = any(v_old_ids);

  -- Preserve all stock by retaining and moving the original variant records.
  update public.product_variants
  set product_id = v_product_id
  where product_id = any(v_old_ids);

  -- Retain useful product images under the consolidated listing.
  update public.product_images
  set product_id = v_product_id
  where product_id = any(v_old_ids);

  -- Merge vehicle compatibility without creating duplicate rows.
  insert into public.product_compatibility (product_id, vehicle_id)
  select distinct v_product_id, pc.vehicle_id
  from public.product_compatibility pc
  where pc.product_id = any(v_old_ids)
  on conflict (product_id, vehicle_id) do nothing;

  delete from public.product_compatibility
  where product_id = any(v_old_ids);

  delete from public.products
  where id = any(v_old_ids);

  -- Keep the card price aligned with the least expensive available variant.
  update public.products
  set name = 'Microfiber Cloth',
      description = 'Keep your vehicle clean and beautifully finished with a versatile microfiber cloth designed for automotive care. Choose from multiple sizes and textures for routine wiping, drying and detailing on suitable surfaces.',
      base_price = coalesce((
        select min(price)
        from public.product_variants
        where product_id = v_product_id
      ), base_price),
      installable = false,
      updated_at = now()
  where id = v_product_id;
end
$$;

commit;

-- Verification: this should return one product with its size/type variants.
select
  p.name as product,
  p.slug,
  pv.name as variant,
  pv.price,
  pv.sku,
  pv.attributes
from public.products p
join public.product_variants pv on pv.product_id = p.id
where p.slug = 'microfiber-cloth'
order by pv.price, pv.name;
