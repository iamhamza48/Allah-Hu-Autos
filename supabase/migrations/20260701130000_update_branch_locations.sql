-- Keep branch contact details intact while updating the two physical locations.
do $$
declare
  v_lahore_id uuid;
  v_quetta_id uuid;
  v_default_phone text := '0333 7778606';
  v_hours text := 'Mon–Sat: 10AM – 9PM';
begin
  select id into v_lahore_id
  from public.branches
  where lower(city) = 'lahore' or lower(name) like '%lahore%'
  order by created_at
  limit 1;

  if v_lahore_id is not null then
    update public.branches
    set name = 'Lahore Branch',
        city = 'Lahore',
        address = jsonb_build_object(
          'address', 'Allah Hu Autos, near Jalyana Gate 1, Bahria Town, Lahore',
          'map_iframe_url', coalesce(nullif(
            case when address like '{%' then (address::jsonb ->> 'map_iframe_url') else '' end, ''
          ), ''),
          'map_link', 'https://maps.app.goo.gl/5GZKe1i7sgRWhN7j6?g_st=iw',
          'hours', coalesce(nullif(
            case when address like '{%' then (address::jsonb ->> 'hours') else '' end, ''
          ), v_hours)
        )::text
    where id = v_lahore_id;
  else
    insert into public.branches (name, address, city, phone, is_active)
    values (
      'Lahore Branch',
      jsonb_build_object('address', 'Allah Hu Autos, near Jalyana Gate 1, Bahria Town, Lahore', 'map_iframe_url', '', 'map_link', 'https://maps.app.goo.gl/5GZKe1i7sgRWhN7j6?g_st=iw', 'hours', v_hours)::text,
      'Lahore', v_default_phone, true
    );
  end if;

  select id into v_quetta_id
  from public.branches
  where lower(city) = 'quetta' or lower(name) like '%quetta%'
  order by created_at
  limit 1;

  if v_quetta_id is not null then
    update public.branches
    set name = 'Quetta Branch',
        city = 'Quetta',
        address = jsonb_build_object(
          'address', 'Allah Hu Autos, Japan Market, Zarghoon Road, Quetta',
          'map_iframe_url', coalesce(nullif(
            case when address like '{%' then (address::jsonb ->> 'map_iframe_url') else '' end, ''
          ), ''),
          'map_link', 'https://maps.app.goo.gl/jHYyyWoQPdav4hoP6?g_st=iw',
          'hours', coalesce(nullif(
            case when address like '{%' then (address::jsonb ->> 'hours') else '' end, ''
          ), v_hours)
        )::text
    where id = v_quetta_id;
  else
    insert into public.branches (name, address, city, phone, is_active)
    values (
      'Quetta Branch',
      jsonb_build_object('address', 'Allah Hu Autos, Japan Market, Zarghoon Road, Quetta', 'map_iframe_url', '', 'map_link', 'https://maps.app.goo.gl/jHYyyWoQPdav4hoP6?g_st=iw', 'hours', v_hours)::text,
      'Quetta', v_default_phone, true
    );
  end if;
end
$$;

select name, city, phone, address, is_active
from public.branches
where lower(city) in ('lahore', 'quetta')
order by city;
