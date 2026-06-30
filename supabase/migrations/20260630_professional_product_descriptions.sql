-- Professional catalogue descriptions for every product currently in the store.
-- Safe to run repeatedly: this updates descriptions only and does not touch prices,
-- inventory, variants, compatibility, images, or order data.

update public.products as p
set description = case
  when p.slug = 'tonyin-polish' then
    'Restore a clean, glossy finish with Tonyin Polish. Designed for routine automotive paint care, it helps revive dull-looking surfaces and leaves the exterior with a polished, well-maintained appearance.'
  when p.slug = 'kangroos-polish' then
    'Give your vehicle a refined, showroom-ready finish with Kangroos Polish. Available in Hard and Cosmic variants, it is a practical choice for enhancing paintwork shine and maintaining a freshly detailed look.'
  when p.slug = 'areon-gel' then
    'Refresh your cabin with Areon Gel, a compact car fragrance created for a pleasant and welcoming interior. Choose between Wish and Black Crystal to match the atmosphere you want inside your vehicle.'
  when p.slug = 'sameili-jello' then
    'Keep your vehicle interior feeling fresh with Sameili Jello. Its compact gel format fits neatly in the cabin and adds a pleasant fragrance without taking up valuable space.'
  when p.slug = 'microfiber-cloth' then
    'Keep your vehicle clean and beautifully finished with a versatile microfiber cloth designed for automotive care. Choose from multiple sizes and textures for routine wiping, drying and detailing on suitable surfaces.'
  when p.slug = 'jumpstart-kit-3in1' then
    'Be better prepared for unexpected battery trouble with the Jumpstart Kit 3-in-1. A practical roadside companion, it combines essential emergency support in a compact package that is easy to keep in your vehicle.'
  when p.slug = 'booster-cable' then
    'A dependable addition to any vehicle emergency kit, this Booster Cable is designed for transferring starting power from a supporting battery when yours is discharged. Keep it stored in the boot for greater confidence on the road.'
  when p.slug = 'quarter-cover-vehicle-specific' then
    'Protect the exposed quarter area of your vehicle with a cover selected for a more accurate, vehicle-specific fit. Choose your make, model and year when ordering so the correct application can be confirmed.'
  when p.slug like 'body-kit-%' then
    p.name || ' gives the vehicle a more complete, sporty exterior profile while preserving a coordinated factory-style appearance. Professional fitting is recommended for secure alignment and the cleanest final result.'
  when p.slug like 'spoiler-%' then
    p.name || ' adds a distinctive finishing touch to the rear of the vehicle, creating a sportier and more refined silhouette. Designed for the named model, it should be professionally aligned for a neat, secure fit.'
  when p.slug like 'bumper-%' then
    p.name || ' is a model-specific exterior component intended to restore or refresh the vehicle''s front or rear appearance. Confirm the exact model and year before ordering to ensure the correct fitment.'
  when p.slug like 'shutter-lid-%' then
    p.name || ' provides practical cargo-area coverage while giving the pickup bed a clean, integrated appearance. Professional installation is recommended to achieve smooth operation, secure mounting and proper alignment.'
  when p.slug like 'ppf-%' then
    p.name || ' is precision-focused protection for frequently touched interior trim and display surfaces. Its discreet finish helps guard against everyday scratches, fingerprints and wear while retaining the cabin''s original look.'
  when p.slug like '%android%' then
    p.name || ' brings navigation, media and smartphone-friendly convenience together in a modern in-dash display. It is a smart cabin upgrade for easier access to entertainment and everyday driving functions; fitment should be confirmed before purchase.'
  when p.slug like 'camera-%' then
    p.name || ' improves visibility around the vehicle and supports more confident manoeuvring in tight spaces. Its universal design suits a range of installations, with professional fitting recommended for reliable positioning and wiring.'
  when p.slug like '%frame%' then
    p.name || ' provides a neat finishing surround for a compatible Android display installation. It helps the upgraded panel sit more naturally within the dashboard; confirm dimensions and dashboard fitment before ordering.'
  when p.slug like '%led%' or p.slug = 'fog-lamp' or p.slug = 'grill-flasher' then
    p.name || ' is a purposeful lighting upgrade designed to improve visibility and give the vehicle a cleaner, more modern appearance. Please confirm socket type, size and electrical compatibility before installation.'
  when p.slug like 'horn-%' then
    p.name || ' delivers a clear, attention-getting warning sound for more confident everyday driving. It is suited to drivers replacing a weak factory horn or upgrading their vehicle''s audible alert; wiring compatibility should be checked before fitting.'
  when p.slug like '%security%' or p.slug like '%central-locking%' or p.slug like '%keyless-entry%' then
    p.name || ' adds practical convenience and an extra layer of protection to your vehicle. Professional installation is recommended so the locking, alert and electrical connections operate correctly with the existing system.'
  when p.slug like '%steering-lock%' then
    p.name || ' provides a strong, visible layer of theft deterrence by restricting steering-wheel movement while the vehicle is parked. Its straightforward design makes it a practical security accessory for everyday use.'
  when p.slug like '%speaker%' or p.slug like 'champion-%' or p.slug like 'xplod-%' then
    p.name || ' is designed to bring clearer, more enjoyable sound to your in-car audio system. It is a practical upgrade for improved music detail and cabin listening; confirm size, mounting depth and system compatibility before purchase.'
  when p.slug like '%woofer%' or p.slug like 'nakamichi-%' or p.slug like 'pioneer-%' then
    p.name || ' adds fuller low-frequency response to your vehicle''s audio setup for a richer, more engaging listening experience. Correct enclosure, power and wiring compatibility should be confirmed for the best result.'
  when p.slug like '%ambient%' or p.slug like 'atmosphere-%' then
    p.name || ' introduces a tasteful glow to the cabin and creates a more premium atmosphere for evening drives. Professional routing of the wiring helps achieve a clean installation that complements the interior.'
  when p.slug like '%air-press%' then
    p.name || ' helps reduce wind turbulence and lets you enjoy ventilation with the windows slightly open. Designed as a practical exterior accessory, it also adds a neat finished edge around the side windows.'
  when p.slug like '%microfiber%' then
    p.name || ' is a practical detailing cloth for routine cleaning, wiping and finishing work. Its car-care-friendly format helps lift dust and moisture while supporting a cleaner, streak-free appearance on suitable surfaces.'
  when p.slug like '%mats%' then
    p.name || ' helps protect the vehicle floor from dust, mud and everyday spills while keeping the cabin easier to clean. Its practical design adds a tidy, finished look to the footwell; confirm the required size and fit before ordering.'
  when p.slug like '%steering-cover%' then
    p.name || ' refreshes the look and feel of the steering wheel while providing a more comfortable, secure hand contact during everyday driving. Confirm your steering-wheel size before purchase for a neat fit.'
  when p.slug like '%cover%' or p.slug like '%shades%' then
    p.name || ' offers practical everyday protection while helping the vehicle maintain a neat, well-kept appearance. Check the listed dimensions or vehicle application before ordering to ensure the right fit.'
  when p.slug like '%charger%' then
    p.name || ' provides convenient in-car charging for compatible mobile devices, helping you stay powered during commutes and longer journeys. Check the connector and vehicle power-socket compatibility before use.'
  else
    p.name || ' is a carefully selected automotive accessory designed to add practical value, comfort or style to your vehicle. Review the available variants and confirm vehicle compatibility before placing your order.'
end;

-- Verification: every product should return a substantial description.
select
  p.name,
  c.name as category,
  p.description
from public.products p
left join public.categories c on c.id = p.category_id
order by c.name, p.name;
