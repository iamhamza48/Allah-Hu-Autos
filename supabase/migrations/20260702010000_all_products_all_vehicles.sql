begin;

insert into public.product_compatibility (product_id, vehicle_id)
select product.id, vehicle.id
from public.products product
cross join public.vehicles vehicle
where product.slug not like 'service-%'
on conflict (product_id, vehicle_id) do nothing;

create or replace function public.sync_new_product_to_all_vehicles()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.slug not like 'service-%' then
    insert into public.product_compatibility (product_id, vehicle_id)
    select new.id, vehicle.id from public.vehicles vehicle
    on conflict (product_id, vehicle_id) do nothing;
  end if;
  return new;
end;
$$;

create or replace function public.sync_new_vehicle_to_all_products()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.product_compatibility (product_id, vehicle_id)
  select product.id, new.id
  from public.products product
  where product.slug not like 'service-%'
  on conflict (product_id, vehicle_id) do nothing;
  return new;
end;
$$;

drop trigger if exists sync_new_product_compatibility on public.products;
create trigger sync_new_product_compatibility
after insert on public.products
for each row execute function public.sync_new_product_to_all_vehicles();

drop trigger if exists sync_new_vehicle_compatibility on public.vehicles;
create trigger sync_new_vehicle_compatibility
after insert on public.vehicles
for each row execute function public.sync_new_vehicle_to_all_products();

commit;
