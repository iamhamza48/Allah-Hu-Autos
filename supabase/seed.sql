-- ============================================
-- Allah-Hu-Autos — Seed Data
-- ============================================

-- ==================
-- Categories (43)
-- ==================
INSERT INTO categories (name, slug, icon, featured) VALUES
('LED Lights', 'led-lights', '💡', true),
('Seat Covers', 'seat-covers', '💺', true),
('Car Curtains', 'car-curtains', '🪟', false),
('Horns', 'horns', '📢', false),
('Body Kits', 'body-kits', '🏎️', true),
('Spoilers', 'spoilers', '🦅', false),
('Car Mats', 'car-mats', '🟫', true),
('Key Covers', 'key-covers', '🔑', false),
('Security Systems', 'security-systems', '🔒', true),
('Car Perfumes', 'car-perfumes', '🌸', false),
('Android Panels', 'android-panels', '📱', true),
('Ambient Lights', 'ambient-lights', '🌈', true),
('Steering Covers', 'steering-covers', '🎯', false),
('Batman Covers', 'batman-covers', '🦇', false),
('Interior Accessories', 'interior-accessories', '🏠', true),
('Fog Lamps', 'fog-lamps', '🌫️', false),
('Bumpers', 'bumpers', '🛡️', false),
('Cameras', 'cameras', '📷', true),
('Car Speakers', 'car-speakers', '🔊', true),
('Window Tints', 'window-tints', '🕶️', false),
('Car Covers', 'car-covers', '🧥', false),
('Dashboard Accessories', 'dashboard-accessories', '📊', false),
('Gear Shift Covers', 'gear-shift-covers', '⚙️', false),
('Side Mirror Covers', 'side-mirror-covers', '🪞', false),
('Door Handle Covers', 'door-handle-covers', '🚪', false),
('Headlight Covers', 'headlight-covers', '🔦', false),
('Tail Light Covers', 'tail-light-covers', '🔴', false),
('Roof Racks', 'roof-racks', '🏗️', false),
('Mud Flaps', 'mud-flaps', '💧', false),
('Number Plate Frames', 'number-plate-frames', '🔢', true),
('Sun Shades', 'sun-shades', '☀️', false),
('Tissue Box Holders', 'tissue-box-holders', '🧻', false),
('Phone Holders', 'phone-holders', '📲', true),
('Car Chargers', 'car-chargers', '🔌', false),
('Trunk Organizers', 'trunk-organizers', '📦', false),
('Neck Pillows', 'neck-pillows', '🛏️', false),
('Steering Wheel Locks', 'steering-wheel-locks', '🔐', false),
('Car Vacuum Cleaners', 'car-vacuum-cleaners', '🧹', false),
('Jump Starters', 'jump-starters', '⚡', false),
('Tyre Inflators', 'tyre-inflators', '🎈', false),
('Tool Kits', 'tool-kits', '🧰', false),
('Paint Protection Film', 'paint-protection-film', '🎨', false),
('Vinyl Wraps', 'vinyl-wraps', '🖼️', true);

-- ==================
-- Vehicle Makes (8)
-- ==================
INSERT INTO vehicle_makes (name, slug) VALUES
('Toyota', 'toyota'),
('Honda', 'honda'),
('Suzuki', 'suzuki'),
('KIA', 'kia'),
('Hyundai', 'hyundai'),
('MG', 'mg'),
('Changan', 'changan'),
('Daihatsu', 'daihatsu');

-- ==================
-- Vehicle Models (30)
-- ==================
INSERT INTO vehicle_models (make_id, name, slug) VALUES
((SELECT id FROM vehicle_makes WHERE slug='toyota'), 'Corolla', 'corolla'),
((SELECT id FROM vehicle_makes WHERE slug='toyota'), 'Yaris', 'yaris'),
((SELECT id FROM vehicle_makes WHERE slug='toyota'), 'Camry', 'camry'),
((SELECT id FROM vehicle_makes WHERE slug='toyota'), 'Fortuner', 'fortuner'),
((SELECT id FROM vehicle_makes WHERE slug='toyota'), 'Hilux', 'hilux'),
((SELECT id FROM vehicle_makes WHERE slug='honda'), 'Civic', 'civic'),
((SELECT id FROM vehicle_makes WHERE slug='honda'), 'City', 'city'),
((SELECT id FROM vehicle_makes WHERE slug='honda'), 'BR-V', 'br-v'),
((SELECT id FROM vehicle_makes WHERE slug='honda'), 'HR-V', 'hr-v'),
((SELECT id FROM vehicle_makes WHERE slug='suzuki'), 'Alto', 'alto'),
((SELECT id FROM vehicle_makes WHERE slug='suzuki'), 'Cultus', 'cultus'),
((SELECT id FROM vehicle_makes WHERE slug='suzuki'), 'WagonR', 'wagon-r'),
((SELECT id FROM vehicle_makes WHERE slug='suzuki'), 'Swift', 'swift'),
((SELECT id FROM vehicle_makes WHERE slug='suzuki'), 'Mehran', 'mehran'),
((SELECT id FROM vehicle_makes WHERE slug='kia'), 'Sportage', 'sportage'),
((SELECT id FROM vehicle_makes WHERE slug='kia'), 'Picanto', 'picanto'),
((SELECT id FROM vehicle_makes WHERE slug='kia'), 'Sorento', 'sorento'),
((SELECT id FROM vehicle_makes WHERE slug='kia'), 'Stonic', 'stonic'),
((SELECT id FROM vehicle_makes WHERE slug='hyundai'), 'Elantra', 'elantra'),
((SELECT id FROM vehicle_makes WHERE slug='hyundai'), 'Tucson', 'tucson'),
((SELECT id FROM vehicle_makes WHERE slug='hyundai'), 'Sonata', 'sonata'),
((SELECT id FROM vehicle_makes WHERE slug='hyundai'), 'Santa Fe', 'santa-fe'),
((SELECT id FROM vehicle_makes WHERE slug='mg'), 'HS', 'hs'),
((SELECT id FROM vehicle_makes WHERE slug='mg'), 'ZS', 'zs'),
((SELECT id FROM vehicle_makes WHERE slug='mg'), 'GT', 'gt'),
((SELECT id FROM vehicle_makes WHERE slug='changan'), 'Alsvin', 'alsvin'),
((SELECT id FROM vehicle_makes WHERE slug='changan'), 'Oshan X7', 'oshan-x7'),
((SELECT id FROM vehicle_makes WHERE slug='changan'), 'Karvaan', 'karvaan'),
((SELECT id FROM vehicle_makes WHERE slug='daihatsu'), 'Mira', 'mira'),
((SELECT id FROM vehicle_makes WHERE slug='daihatsu'), 'Move', 'move');

-- ==================
-- Vehicles (50 combinations)
-- ==================
INSERT INTO vehicles (model_id, year)
SELECT m.id, y.year
FROM vehicle_models m
CROSS JOIN (
  SELECT generate_series(2018, 2026) AS year
) y
ORDER BY random()
LIMIT 50;

-- ==================
-- Branches
-- ==================
INSERT INTO branches (name, address, city, phone) VALUES
('Allah-Hu-Autos Main', 'Shop #12, Main Boulevard, Gulberg III', 'Lahore', '+92 300 1234567'),
('Allah-Hu-Autos DHA', 'Plot 45-C, DHA Phase 5', 'Lahore', '+92 301 2345678'),
('Allah-Hu-Autos Islamabad', 'F-7 Markaz, Jinnah Super', 'Islamabad', '+92 302 3456789'),
('Allah-Hu-Autos Karachi', 'Shop 8, Tariq Road', 'Karachi', '+92 303 4567890');

-- ==================
-- Products (150+)
-- ==================
DO $$
DECLARE
  cat_record RECORD;
  prod_count INT;
  prod_id UUID;
  i INT;
  base_p NUMERIC;
  comp_p NUMERIC;
  prod_names TEXT[];
  prod_name TEXT;
BEGIN
  FOR cat_record IN SELECT id, name, slug FROM categories LOOP
    -- Generate 3-5 products per category
    prod_count := 3 + floor(random() * 3)::int;

    FOR i IN 1..prod_count LOOP
      base_p := (500 + floor(random() * 119500))::numeric;
      comp_p := CASE WHEN random() > 0.5 THEN base_p + (base_p * 0.2) ELSE NULL END;

      prod_name := cat_record.name || ' ' ||
        CASE i
          WHEN 1 THEN 'Premium'
          WHEN 2 THEN 'Standard'
          WHEN 3 THEN 'Deluxe'
          WHEN 4 THEN 'Pro'
          ELSE 'Elite'
        END;

      INSERT INTO products (name, slug, description, category_id, base_price, compare_price, installable, featured)
      VALUES (
        prod_name,
        cat_record.slug || '-' || CASE i WHEN 1 THEN 'premium' WHEN 2 THEN 'standard' WHEN 3 THEN 'deluxe' WHEN 4 THEN 'pro' ELSE 'elite' END,
        'High quality ' || lower(cat_record.name) || ' for your vehicle. Premium build quality with easy installation. Compatible with most Pakistani vehicles.',
        cat_record.id,
        base_p,
        comp_p,
        random() > 0.5,
        random() > 0.7
      )
      RETURNING id INTO prod_id;

      -- 3 variants per product
      INSERT INTO product_variants (product_id, name, sku, price, compare_price, attributes) VALUES
      (prod_id, 'Standard', cat_record.slug || '-std-' || i, base_p, comp_p, '{"type": "standard"}'::jsonb),
      (prod_id, 'Premium', cat_record.slug || '-prm-' || i, base_p * 1.3, CASE WHEN comp_p IS NOT NULL THEN comp_p * 1.3 ELSE NULL END, '{"type": "premium"}'::jsonb),
      (prod_id, 'Luxury', cat_record.slug || '-lux-' || i, base_p * 1.7, CASE WHEN comp_p IS NOT NULL THEN comp_p * 1.7 ELSE NULL END, '{"type": "luxury"}'::jsonb);

      -- 2 placeholder images per product
      INSERT INTO product_images (product_id, url, alt, sort_order) VALUES
      (prod_id, 'https://placehold.co/600x400/e11d48/white?text=' || replace(prod_name, ' ', '+'), prod_name, 0),
      (prod_id, 'https://placehold.co/600x400/09090b/white?text=' || replace(prod_name, ' ', '+'), prod_name || ' - View 2', 1);

    END LOOP;
  END LOOP;
END $$;

-- ==================
-- Product Compatibility (random assignments)
-- ==================
INSERT INTO product_compatibility (product_id, vehicle_id)
SELECT p.id, v.id
FROM products p
CROSS JOIN vehicles v
WHERE random() < 0.15
ON CONFLICT DO NOTHING;

-- ==================
-- Sample Inventory
-- ==================
INSERT INTO inventory (variant_id, branch_id, quantity)
SELECT pv.id, b.id, (5 + floor(random() * 95))::int
FROM product_variants pv
CROSS JOIN branches b
WHERE random() < 0.3;
