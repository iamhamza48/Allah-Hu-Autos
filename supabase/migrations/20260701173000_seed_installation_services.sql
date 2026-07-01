-- Service pages reuse the proven products/product_images infrastructure.
-- Their category is excluded from the public shop and managed under Admin -> Services.
with service_category as (
  select id from public.categories where slug = 'car-modification-styling'
), service_data(id, name, price, description, image_url) as (
  values
    ('4x4-face-lifts', '4x4 Face Lifts', 150000::numeric, 'Refresh the exterior character of your 4x4 with carefully selected front-end and styling upgrades.', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=85&fit=crop'),
    ('ppf', 'Paint Protection Film', 85000, 'Help protect frequently exposed painted or interior surfaces from everyday scratches and wear.', 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=1200&q=85&fit=crop'),
    ('detailing', 'Professional Detailing', 15000, 'A thorough appearance-care service designed to restore a cleaner, fresher and more polished finish.', 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=1200&q=85&fit=crop'),
    ('wrapping', 'Vehicle Wrapping', 120000, 'Transform or protect selected vehicle surfaces with professionally applied automotive wrap.', 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1200&q=85&fit=crop'),
    ('anti-uv-tints', 'Anti-UV Window Tints', 12000, 'Reduce glare and ultraviolet exposure while giving the glass a clean, refined appearance.', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1200&q=85&fit=crop'),
    ('sports-kits', 'Sports Kits', 65000, 'Give your vehicle a coordinated, sportier exterior with professionally aligned styling components.', 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1200&q=85&fit=crop'),
    ('sports-exhaust', 'Sports Exhaust', 25000, 'Upgrade the rear styling and exhaust character with a solution selected for your vehicle.', 'https://images.unsplash.com/photo-1611821064430-0d40291d0f0b?w=1200&q=85&fit=crop'),
    ('seat-covers', 'Seat Covers', 18000, 'Refresh cabin comfort and appearance with neatly fitted covers selected for your seating layout.', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85&fit=crop'),
    ('mats', 'Car Mats', 8000, 'Protect your vehicle floor with a cleanly fitted mat solution suited to your cabin.', 'https://images.unsplash.com/photo-1570733577524-3a047079e80d?w=1200&q=85&fit=crop'),
    ('polishes', 'Paint Polishing', 10000, 'Improve gloss and revive tired-looking paintwork with professional surface preparation and polishing.', 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=1200&q=85&fit=crop'),
    ('sun-visors', 'Sun Visors', 5000, 'Add practical shade and a tidy exterior accent with correctly aligned visor installation.', 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=85&fit=crop'),
    ('air-press', 'Air Press Installation', 6000, 'Reduce wind turbulence with vehicle-appropriate air press fitted neatly around the windows.', 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=85&fit=crop'),
    ('fog-lamps', 'Fog Lamp Installation', 12000, 'Improve low-level road illumination and complete the front-end look with professional fitting.', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=85&fit=crop'),
    ('anti-heat-tints', 'Heat-Reducing Tints', 18000, 'Improve cabin comfort by reducing solar heat and glare through professionally applied film.', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1200&q=85&fit=crop')
), inserted as (
  insert into public.products (name, slug, description, category_id, base_price, installable, featured, show_in_new_arrivals)
  select d.name, 'service-' || d.id, d.description, c.id, d.price, true, false, false
  from service_data d cross join service_category c
  on conflict (slug) do nothing
  returning id
)
insert into public.product_images (product_id, url, alt, sort_order)
select p.id, d.image_url, d.name, 0
from service_data d
join public.products p on p.slug = 'service-' || d.id
where not exists (select 1 from public.product_images pi where pi.product_id = p.id);
