-- Adds the requested makes, models, and Pakistan model years through 2026.
-- Idempotent: safe to run more than once without duplicating vehicle-year rows.

begin;

with make_data(name, slug) as (
  values
    ('JAC', 'jac'),
    ('BYD', 'byd'),
    ('Haval', 'haval'),
    ('JAECOO', 'jaecoo'),
    ('Chery', 'chery'),
    ('Changan (Deepal)', 'changan-deepal')
), upserted_makes as (
  insert into public.vehicle_makes (name, slug)
  select name, slug from make_data
  on conflict (slug) do update
    set name = excluded.name
  returning id, slug
), model_data(make_slug, name, slug, first_year) as (
  values
    ('jac',              'T9',       'jac-t9',              2025),
    ('byd',              'Atto 3',   'byd-atto-3',          2024),
    ('byd',              'Shark',    'byd-shark',           2025),
    ('haval',            'Jolion',   'haval-jolion',        2022),
    ('haval',            'H6',       'haval-h6',            2022),
    ('jaecoo',           'J5',       'jaecoo-j5',           2025),
    ('jaecoo',           'J7',       'jaecoo-j7',           2025),
    ('chery',            'Tiggo 7',  'chery-tiggo-7',       2025),
    ('chery',            'Tiggo 8',  'chery-tiggo-8',       2025),
    ('chery',            'Tiggo 9',  'chery-tiggo-9',       2025),
    ('changan-deepal',   'S05',      'changan-deepal-s05',  2025),
    ('changan-deepal',   'S07',      'changan-deepal-s07',  2024)
), upserted_models as (
  insert into public.vehicle_models (make_id, name, slug)
  select makes.id, models.name, models.slug
  from model_data models
  join upserted_makes makes on makes.slug = models.make_slug
  on conflict (slug) do update
    set make_id = excluded.make_id,
        name = excluded.name
  returning id, slug
), requested_vehicle_years as (
  select models.id as model_id, years.year
  from model_data definitions
  join upserted_models models on models.slug = definitions.slug
  cross join lateral generate_series(definitions.first_year, 2026) as years(year)
)
insert into public.vehicles (model_id, year)
select requested.model_id, requested.year
from requested_vehicle_years requested
where not exists (
  select 1
  from public.vehicles existing
  where existing.model_id = requested.model_id
    and existing.year = requested.year
);

commit;

-- Verification output: one row per requested make/model with all available years.
select
  makes.name as make,
  models.name as model,
  array_agg(vehicles.year order by vehicles.year) as years
from public.vehicle_makes makes
join public.vehicle_models models on models.make_id = makes.id
join public.vehicles vehicles on vehicles.model_id = models.id
where models.slug in (
  'jac-t9',
  'byd-atto-3',
  'byd-shark',
  'haval-jolion',
  'haval-h6',
  'jaecoo-j5',
  'jaecoo-j7',
  'chery-tiggo-7',
  'chery-tiggo-8',
  'chery-tiggo-9',
  'changan-deepal-s05',
  'changan-deepal-s07'
)
group by makes.name, models.name
order by makes.name, models.name;
