-- Accessories becomes an independent shop category.
-- Protection and Body Parts records remain linked for administrative and
-- historical integrity; the public application presents them as services.
update public.categories
set parent_id = null,
    sort_order = 1
where slug = 'car-mod-accessories';

update public.categories
set featured = false
where slug in ('protection', 'body-parts', 'car-modification-styling');

select name, slug, parent_id, featured
from public.categories
where slug in ('car-mod-accessories', 'protection', 'body-parts', 'car-modification-styling')
order by name;
