import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const __dirname = path.resolve();

const url = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE';

if (url === 'YOUR_SUPABASE_URL_HERE' || key === 'YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE') {
    console.error('❌ Missing Supabase URL or Service Role Key.');
    process.exit(1);
}

const supabase = createClient(url, key);
const BUCKET_NAME = 'product-images';

// ─── Helper: Upload image ────────────────────────────────────────────────────
async function uploadImage(localFilePath, folderName) {
    try {
        if (!fs.existsSync(localFilePath)) {
            console.warn(`⚠️  Image not found: ${localFilePath} — using placeholder`);
            return null;
        }
        const fileName = path.basename(localFilePath);
        const storagePath = `${folderName}/${Date.now()}-${fileName}`;
        const fileBuffer = fs.readFileSync(localFilePath);
        const contentType = mime.lookup(localFilePath) || 'image/jpeg';

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(storagePath, fileBuffer, { contentType, upsert: false });

        if (error) throw error;

        const { data: pub } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
        return pub.publicUrl;
    } catch (err) {
        console.error(`❌ Upload failed for ${localFilePath}:`, err.message);
        return null;
    }
}

// ─── Helper: upsert category ─────────────────────────────────────────────────
async function upsertCategory({ name, slug, icon, featured, imagePath, parentId, sortOrder }) {
    let imageUrl = null;
    if (imagePath) {
        imageUrl = await uploadImage(path.join(__dirname, imagePath), 'categories');
    }
    const { data, error } = await supabase
        .from('categories')
        .upsert({
            name,
            slug,
            icon: icon || '🔧',
            featured: featured || false,
            image_url: imageUrl || 'https://placehold.co/500x400?text=' + encodeURIComponent(name),
            parent_id: parentId || null,
            sort_order: sortOrder || 0,
        }, { onConflict: 'slug' })
        .select()
        .single();

    if (error) { console.error(`❌ Category "${name}":`, error.message); return null; }
    console.log(`  ✅ Category: ${name}`);
    return data;
}

// ─── Helper: upsert product ──────────────────────────────────────────────────
async function upsertProduct({ name, slug, description, categoryId, basePrice, comparePrice, installable, featured, imagePath }) {
    const { data, error } = await supabase
        .from('products')
        .upsert({
            name,
            slug,
            description: description || `High quality ${name}.`,
            category_id: categoryId,
            base_price: basePrice,
            compare_price: comparePrice || Math.round(basePrice * 1.2),
            installable: installable || false,
            featured: featured || false,
        }, { onConflict: 'slug' })
        .select()
        .single();

    if (error) { console.error(`❌ Product "${name}":`, error.message); return null; }

    if (imagePath) {
        const imageUrl = await uploadImage(path.join(__dirname, imagePath), 'products');
        if (imageUrl) {
            await supabase.from('product_images').insert({ product_id: data.id, url: imageUrl, sort_order: 1 });
        }
    }

    return data;
}

// ─── Helper: upsert variant ──────────────────────────────────────────────────
async function upsertVariant({ productId, name, sku, price, comparePrice, attributes }) {
    const { data, error } = await supabase
        .from('product_variants')
        .upsert({
            product_id: productId,
            name,
            sku,
            price,
            compare_price: comparePrice || Math.round(price * 1.2),
            attributes: attributes || {},
        }, { onConflict: 'sku' })
        .select()
        .single();

    if (error) { console.error(`  ❌ Variant "${name}" (${sku}):`, error.message); return null; }
    return data;
}

// ─── Helper: get or create vehicle make ──────────────────────────────────────
async function getOrCreateMake(name) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const { data, error } = await supabase
        .from('vehicle_makes')
        .upsert({ name, slug }, { onConflict: 'slug' })
        .select()
        .single();
    if (error) { console.error(`❌ Make "${name}":`, error.message); return null; }
    return data;
}

// ─── Helper: get or create vehicle model ─────────────────────────────────────
async function getOrCreateModel(makeId, name) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const { data, error } = await supabase
        .from('vehicle_models')
        .upsert({ make_id: makeId, name, slug }, { onConflict: 'slug' })
        .select()
        .single();
    if (error) { console.error(`❌ Model "${name}":`, error.message); return null; }
    return data;
}

// ─── Helper: get or create vehicle (model + year) ────────────────────────────
async function getOrCreateVehicle(modelId, year) {
    // Check if it already exists
    const { data: existing } = await supabase
        .from('vehicles')
        .select('id')
        .eq('model_id', modelId)
        .eq('year', year)
        .maybeSingle();

    if (existing) return existing;

    const { data, error } = await supabase
        .from('vehicles')
        .insert({ model_id: modelId, year })
        .select()
        .single();
    if (error) { console.error(`❌ Vehicle year ${year}:`, error.message); return null; }
    return data;
}

// ─── Helper: link product to vehicle ─────────────────────────────────────────
async function linkProductToVehicle(productId, vehicleId) {
    const { error } = await supabase
        .from('product_compatibility')
        .upsert({ product_id: productId, vehicle_id: vehicleId }, { onConflict: 'product_id,vehicle_id' });
    if (error) console.error(`  ❌ Compatibility link:`, error.message);
}

// ─── Helper: seed compatibility for a product ────────────────────────────────
// compatData = [{ make: 'Toyota', model: 'Corolla', years: [2010, 2012, 2015, 2018, 2022] }]
async function seedCompatibility(productId, compatData) {
    for (const entry of compatData) {
        const make = await getOrCreateMake(entry.make);
        if (!make) continue;
        const model = await getOrCreateModel(make.id, entry.model);
        if (!model) continue;
        for (const year of entry.years) {
            const vehicle = await getOrCreateVehicle(model.id, year);
            if (!vehicle) continue;
            await linkProductToVehicle(productId, vehicle.id);
        }
    }
}

// ════════════════════════════════════════════════════════════════════════════
//  MAIN SEED
// ════════════════════════════════════════════════════════════════════════════
async function seed() {
    console.log('\n🚀 Starting Allah-Hu-Autos Database Seed...\n');

    // ── STEP 1: Parent Categories ────────────────────────────────────────────
    console.log('📁 Seeding parent categories...');
    const parentDefs = [
        { name: 'LEDs', slug: 'leds', icon: '💡', featured: true, sortOrder: 1 },
        { name: 'Steering Covers', slug: 'steering-covers', icon: '🎯', featured: true, sortOrder: 2 },
        { name: 'Car Speakers', slug: 'car-speakers', icon: '🔊', featured: true, sortOrder: 3 },
        { name: 'Woofers', slug: 'woofers', icon: '🔊', featured: false, sortOrder: 4 },
        { name: 'Android Panels', slug: 'android-panels', icon: '📱', featured: true, sortOrder: 5 },
        { name: 'Ambient Lights', slug: 'ambient-lights', icon: '🌈', featured: true, sortOrder: 6 },
        { name: 'Horns', slug: 'horns', icon: '📢', featured: false, sortOrder: 7 },
        { name: 'Fog Lamps', slug: 'fog-lamps', icon: '💡', featured: true, sortOrder: 8 },
        { name: 'Steering Locks', slug: 'steering-locks', icon: '🔐', featured: false, sortOrder: 9 },
        { name: 'Starting Kits', slug: 'starting-kits', icon: '🔋', featured: false, sortOrder: 10 },
        { name: 'Microfiber', slug: 'microfiber', icon: '🧽', featured: false, sortOrder: 11 },
        { name: 'Mobile Chargers', slug: 'mobile-chargers', icon: '🔌', featured: false, sortOrder: 12 },
        { name: 'Brake Caliper Covers', slug: 'brake-caliper-covers', icon: '🚗', featured: false, sortOrder: 13 },
        { name: 'Mats', slug: 'mats', icon: '🚗', featured: false, sortOrder: 14 },
        { name: 'Side Shades', slug: 'side-shades', icon: '🚗', featured: false, sortOrder: 15 },
        { name: 'Top Covers', slug: 'top-covers', icon: '🚗', featured: false, sortOrder: 16 },
        { name: 'Spoilers', slug: 'spoilers', icon: '🚗', featured: true, sortOrder: 17 },
        { name: 'Shutter Lids', slug: 'shutter-lids', icon: '🚗', featured: false, sortOrder: 18 },
        { name: 'Body Kits', slug: 'body-kits', icon: '🚗', featured: true, sortOrder: 19 },
        { name: 'Air Press', slug: 'air-press', icon: '🚗', featured: false, sortOrder: 20 },
        { name: 'Quarter Covers', slug: 'quarter-covers', icon: '🚗', featured: false, sortOrder: 21 },
        { name: 'Batman Covers', slug: 'batman-covers', icon: '🚗', featured: false, sortOrder: 22 },
        { name: 'Security Systems', slug: 'security-systems', icon: '🔒', featured: false, sortOrder: 23 },
        { name: 'Cameras & Frames', slug: 'cameras-frames', icon: '📷', featured: false, sortOrder: 24 },
        { name: 'Bumpers', slug: 'bumpers', icon: '🚘', featured: true, sortOrder: 25 },
        { name: 'Interior PPF', slug: 'interior-ppf', icon: '🛡️', featured: false, sortOrder: 26 },
    ];

    const pCat = {}; // parentSlug → id
    for (const def of parentDefs) {
        const cat = await upsertCategory(def);
        if (cat) pCat[def.slug] = cat.id;
    }

    // ── STEP 2: LED Sub-categories ───────────────────────────────────────────
    console.log('\n📁 Seeding LED sub-categories...');
    const ledSubDefs = [
        { name: 'Headlight LEDs', slug: 'headlight-leds', icon: '💡', parentId: pCat['leds'], sortOrder: 1 },
        { name: 'Fog LEDs', slug: 'fog-leds', icon: '💡', parentId: pCat['leds'], sortOrder: 2 },
        { name: 'Parking SMD', slug: 'parking-smd', icon: '💡', parentId: pCat['leds'], sortOrder: 3 },
        { name: 'Indicator LED', slug: 'indicator-led', icon: '🟠', parentId: pCat['leds'], sortOrder: 4 },
        { name: 'Reverse LED', slug: 'reverse-led', icon: '⚪', parentId: pCat['leds'], sortOrder: 5 },
        { name: 'Brake LED', slug: 'brake-led', icon: '🔴', parentId: pCat['leds'], sortOrder: 6 },
        { name: 'Grill Flasher', slug: 'grill-flasher', icon: '💡', parentId: pCat['leds'], sortOrder: 7 },
    ];

    const subCat = {}; // subSlug → id
    for (const def of ledSubDefs) {
        const cat = await upsertCategory(def);
        if (cat) subCat[def.slug] = cat.id;
    }

    await pause();

    // ════════════════════════════════════════════════════════════════════════
    //  STEP 3: PRODUCTS + VARIANTS
    // ════════════════════════════════════════════════════════════════════════
    console.log('\n📦 Seeding products...\n');

    // ── 3.1 HEADLIGHT LEDs ────────────────────────────────────────────────────
    console.log('💡 Headlight LEDs...');

    const headlightLEDs = [
        // GPNE
        { name: 'GPNE RS8 LED Headlight', slug: 'gpne-rs8-led', sizes: ['9005', 'H4', 'H11'], basePrice: 3500 },
        { name: 'GPNE RS6 LED Headlight', slug: 'gpne-rs6-led', sizes: ['9005', 'H4', 'H11'], basePrice: 2800 },
        // Golden Eyes
        { name: 'Golden Eyes K100 LED Headlight', slug: 'golden-eyes-k100-led', sizes: ['9005', 'H4', 'H11', 'H7'], basePrice: 3200 },
        { name: 'Golden Eyes K150 LED Headlight', slug: 'golden-eyes-k150-led', sizes: ['9005', 'H4', 'H11', 'H7'], basePrice: 3800 },
        // Fuji
        { name: 'Fuji 1000 LED Headlight', slug: 'fuji-1000-led', sizes: ['9005', 'H4', 'H11'], basePrice: 2500 },
        { name: 'Fuji 1500 LED Headlight', slug: 'fuji-1500-led', sizes: ['9005', 'H4', 'H11'], basePrice: 3000 },
        // M8 Pro
        { name: 'M8 Pro LED Headlight', slug: 'm8-pro-led', sizes: ['9005', 'H4', 'H11'], basePrice: 4000 },
    ];

    for (const p of headlightLEDs) {
        const prod = await upsertProduct({
            name: p.name, slug: p.slug,
            categoryId: subCat['headlight-leds'],
            basePrice: p.basePrice, installable: true, featured: true,
        });
        if (!prod) continue;
        for (const size of p.sizes) {
            await upsertVariant({
                productId: prod.id,
                name: size,
                sku: `${p.slug.toUpperCase()}-${size}`,
                price: p.basePrice,
                attributes: { size },
            });
        }
        console.log(`  ✅ ${p.name} (${p.sizes.join(', ')})`);
    }

    // ── 3.2 FOG LEDs ─────────────────────────────────────────────────────────
    console.log('\n💡 Fog LEDs...');

    const fogLEDs = [
        { name: 'KAIER Fog LED White', slug: 'kaier-fog-white', variants: [{ color: 'White', size: 'H11' }, { color: 'White', size: '9005' }], basePrice: 1200 },
        { name: 'Golden Eyes Fog LED White', slug: 'golden-eyes-fog-white', variants: [{ color: 'White', size: 'H11' }], basePrice: 1300 },
        { name: 'Lime Green Lemon Fog LED', slug: 'lime-green-fog-lemon', variants: [{ color: 'Lemon', size: 'H11' }], basePrice: 1100 },
    ];

    for (const p of fogLEDs) {
        const prod = await upsertProduct({
            name: p.name, slug: p.slug,
            categoryId: subCat['fog-leds'],
            basePrice: p.basePrice, installable: true,
        });
        if (!prod) continue;
        for (const v of p.variants) {
            const variantName = `${v.color} ${v.size}`;
            await upsertVariant({
                productId: prod.id,
                name: variantName,
                sku: `${p.slug.toUpperCase()}-${v.color.toUpperCase()}-${v.size}`,
                price: p.basePrice,
                attributes: { color: v.color, size: v.size },
            });
        }
        console.log(`  ✅ ${p.name}`);
    }

    // ── 3.3 PARKING SMD ───────────────────────────────────────────────────────
    console.log('\n💡 Parking SMD...');
    const parkingSMD = await upsertProduct({
        name: 'Parking SMD LED', slug: 'parking-smd-led',
        categoryId: subCat['parking-smd'],
        basePrice: 400,
    });
    if (parkingSMD) {
        for (const color of ['Orange', 'White']) {
            await upsertVariant({ productId: parkingSMD.id, name: color, sku: `PARKING-SMD-${color.toUpperCase()}`, price: 400, attributes: { color } });
        }
        console.log('  ✅ Parking SMD LED (Orange, White)');
    }

    // ── 3.4 INDICATOR LED ────────────────────────────────────────────────────
    console.log('\n🟠 Indicator LED...');
    const indicatorLED = await upsertProduct({
        name: 'Indicator LED Orange', slug: 'indicator-led-orange',
        categoryId: subCat['indicator-led'],
        basePrice: 350,
    });
    if (indicatorLED) {
        await upsertVariant({ productId: indicatorLED.id, name: 'Orange', sku: 'INDICATOR-LED-ORANGE', price: 350, attributes: { color: 'Orange' } });
        console.log('  ✅ Indicator LED Orange');
    }

    // ── 3.5 REVERSE LED ──────────────────────────────────────────────────────
    console.log('\n⚪ Reverse LED...');
    const reverseLED = await upsertProduct({
        name: 'Reverse LED White', slug: 'reverse-led-white',
        categoryId: subCat['reverse-led'],
        basePrice: 350,
    });
    if (reverseLED) {
        await upsertVariant({ productId: reverseLED.id, name: 'White', sku: 'REVERSE-LED-WHITE', price: 350, attributes: { color: 'White' } });
        console.log('  ✅ Reverse LED White');
    }

    // ── 3.6 BRAKE LED ────────────────────────────────────────────────────────
    console.log('\n🔴 Brake LED...');
    const brakeLED = await upsertProduct({
        name: 'Brake LED Red', slug: 'brake-led-red',
        categoryId: subCat['brake-led'],
        basePrice: 350,
    });
    if (brakeLED) {
        await upsertVariant({ productId: brakeLED.id, name: 'Red', sku: 'BRAKE-LED-RED', price: 350, attributes: { color: 'Red' } });
        console.log('  ✅ Brake LED Red');
    }

    // ── 3.7 GRILL FLASHER ────────────────────────────────────────────────────
    console.log('\n💡 Grill Flasher...');
    const flasherPacks = [
        { pcs: 4, basePrice: 800 },
        { pcs: 8, basePrice: 1400 },
    ];
    for (const pack of flasherPacks) {
        const prod = await upsertProduct({
            name: `Grill Flasher ${pack.pcs}pcs`, slug: `grill-flasher-${pack.pcs}pcs`,
            categoryId: subCat['grill-flasher'],
            basePrice: pack.basePrice, installable: true,
        });
        if (!prod) continue;
        for (const color of ['Red', 'Blue', 'White']) {
            await upsertVariant({
                productId: prod.id, name: color,
                sku: `GRILL-FLASH-${pack.pcs}PCS-${color.toUpperCase()}`,
                price: pack.basePrice, attributes: { color, pieces: pack.pcs },
            });
        }
        console.log(`  ✅ Grill Flasher ${pack.pcs}pcs (Red, Blue, White)`);
    }

    await pause();

    // ── 3.8 STEERING COVERS ───────────────────────────────────────────────────
    console.log('\n🎯 Steering Covers...');
    const steeringTypes = [
        { type: 'Dotted', slug: 'steering-cover-dotted', price: 600 },
        { type: 'Plain', slug: 'steering-cover-plain', price: 500 },
        { type: 'Alcantara', slug: 'steering-cover-alcantara', price: 900 },
    ];
    for (const st of steeringTypes) {
        const prod = await upsertProduct({
            name: `${st.type} Steering Cover`, slug: st.slug,
            categoryId: pCat['steering-covers'],
            basePrice: st.price,
        });
        if (!prod) continue;
        for (const variant of ['Carbon', 'Non-Carbon']) {
            await upsertVariant({
                productId: prod.id, name: variant,
                sku: `${st.slug.toUpperCase()}-${variant.toUpperCase().replace('-', '')}`,
                price: st.price + (variant === 'Carbon' ? 200 : 0),
                attributes: { finish: variant },
            });
        }
        console.log(`  ✅ ${st.type} Steering Cover (Carbon, Non-Carbon)`);
    }

    // ── 3.9 CAR SPEAKERS ──────────────────────────────────────────────────────
    console.log('\n🔊 Car Speakers...');
    const speakers = [
        { name: 'Champion TS6975 6x9', slug: 'champion-ts6975', size: '6x9', price: 2800 },
        { name: 'Champion TS1618 6x6', slug: 'champion-ts1618', size: '6x6', price: 2200 },
        { name: 'Champion Pioneer TS1675 6x6', slug: 'champion-pioneer-ts1675', size: '6x6', price: 2500 },
        { name: 'Xplod GTF6937 6x9', slug: 'xplod-gtf6937', size: '6x9', price: 3000 },
        { name: 'Xplod GTF6914 6x9', slug: 'xplod-gtf6914', size: '6x9', price: 2700 },
        // Japanese Speakers — each fitting is a variant on one product
    ];
    for (const sp of speakers) {
        const prod = await upsertProduct({
            name: sp.name, slug: sp.slug,
            categoryId: pCat['car-speakers'],
            basePrice: sp.price,
        });
        if (!prod) continue;
        await upsertVariant({ productId: prod.id, name: 'Default', sku: `${sp.slug.toUpperCase()}-DEFAULT`, price: sp.price, attributes: { size: sp.size } });
        console.log(`  ✅ ${sp.name}`);
    }

    // Japanese Speakers — vehicle fitting as variant
    const japaneseSpeakers = await upsertProduct({
        name: 'Japanese Speakers 6x6', slug: 'japanese-speakers-6x6',
        categoryId: pCat['car-speakers'],
        basePrice: 2000,
    });
    if (japaneseSpeakers) {
        for (const fitting of ['Toyota Fitting', 'Honda Fitting', 'Universal']) {
            await upsertVariant({
                productId: japaneseSpeakers.id, name: fitting,
                sku: `JP-SPEAKER-6X6-${fitting.toUpperCase().replace(' ', '-')}`,
                price: 2000, attributes: { fitting },
            });
        }
        console.log('  ✅ Japanese Speakers 6x6 (Toyota, Honda, Universal)');
    }

    // ── 3.10 WOOFERS ──────────────────────────────────────────────────────────
    console.log('\n🔊 Woofers...');
    const woofers = [
        { name: 'Pioneer W312D4 12"', slug: 'pioneer-w312d4', price: 15000 },
        { name: 'Nakamichi NBF 25.0A Underseat', slug: 'nakamichi-nbf-25-underseat', price: 12000 },
    ];
    for (const w of woofers) {
        const prod = await upsertProduct({ name: w.name, slug: w.slug, categoryId: pCat['woofers'], basePrice: w.price });
        if (prod) {
            await upsertVariant({ productId: prod.id, name: 'Default', sku: `${w.slug.toUpperCase()}-DEFAULT`, price: w.price, attributes: {} });
            console.log(`  ✅ ${w.name}`);
        }
    }

    await pause();

    // ── 3.11 ANDROID PANELS ───────────────────────────────────────────────────
    console.log('\n📱 Android Panels...');

    const androidPanels = [
        {
            name: 'Kenwood 10 inch Android Panel', slug: 'kenwood-10-android',
            price: 35000, variants: [{ ram: '2GB', rom: '32GB' }],
        },
        {
            name: 'JBL 9 inch Android Panel', slug: 'jbl-9-android',
            price: 28000, variants: [{ ram: '1GB', rom: '16GB' }, { ram: '2GB', rom: '32GB' }],
        },
        {
            name: 'JBL 10 inch Android Panel', slug: 'jbl-10-android',
            price: 32000, variants: [{ ram: '1GB', rom: '16GB' }, { ram: '2GB', rom: '32GB' }],
        },
        {
            name: 'Bose 9 inch Android Panel', slug: 'bose-9-android',
            price: 30000, variants: [{ ram: '1GB', rom: '16GB' }, { ram: '2GB', rom: '32GB' }],
        },
        {
            name: 'Bose 10 inch Android Panel', slug: 'bose-10-android',
            price: 36000, variants: [{ ram: '1GB', rom: '16GB' }, { ram: '2GB', rom: '32GB' }],
        },
    ];

    for (const ap of androidPanels) {
        const prod = await upsertProduct({
            name: ap.name, slug: ap.slug,
            categoryId: pCat['android-panels'],
            basePrice: ap.price, installable: true, featured: true,
        });
        if (!prod) continue;
        for (const v of ap.variants) {
            const variantName = `${v.ram} RAM / ${v.rom} ROM`;
            const priceAdder = v.ram === '2GB' ? 3000 : 0;
            await upsertVariant({
                productId: prod.id, name: variantName,
                sku: `${ap.slug.toUpperCase()}-${v.ram.replace('GB', 'G')}-${v.rom.replace('GB', 'G')}`,
                price: ap.price + priceAdder, attributes: { ram: v.ram, rom: v.rom },
            });
        }
        console.log(`  ✅ ${ap.name}`);
    }

    // ── 3.12 AMBIENT LIGHTS ───────────────────────────────────────────────────
    console.log('\n🌈 Ambient Lights...');

    // RGB Lights
    for (const pcs of [1, 6, 10, 18]) {
        const prod = await upsertProduct({
            name: `RGB Ambient Light ${pcs}pcs`, slug: `rgb-ambient-${pcs}pcs`,
            categoryId: pCat['ambient-lights'],
            basePrice: 500 * pcs, installable: true,
        });
        if (prod) {
            await upsertVariant({ productId: prod.id, name: `${pcs} pieces`, sku: `RGB-AMBIENT-${pcs}PCS`, price: 500 * pcs, attributes: { pieces: pcs } });
            console.log(`  ✅ RGB Ambient Light ${pcs}pcs`);
        }
    }

    // Atmosphere Lights
    const atmosphereLight = await upsertProduct({
        name: 'Atmosphere Light 4pcs', slug: 'atmosphere-light-4pcs',
        categoryId: pCat['ambient-lights'],
        basePrice: 1800, installable: true,
    });
    if (atmosphereLight) {
        await upsertVariant({ productId: atmosphereLight.id, name: '4 pieces', sku: 'ATMOSPHERE-LIGHT-4PCS', price: 1800, attributes: { pieces: 4 } });
        console.log('  ✅ Atmosphere Light 4pcs');
    }

    // ── 3.13 HORNS ────────────────────────────────────────────────────────────
    console.log('\n📢 Horns...');
    const horns = [
        { name: 'Zoto Horn', slug: 'horn-zoto', price: 800 },
        { name: 'Carosa Horn', slug: 'horn-carosa', price: 900 },
        { name: 'OSN Dual Track Horn', slug: 'horn-osn-dual', price: 1200 },
        { name: 'HD Thunder Horn', slug: 'horn-hd-thunder', price: 1100 },
        { name: 'Wireless Siren 200W', slug: 'horn-wireless-siren-200w', price: 2500 },
    ];
    for (const h of horns) {
        const prod = await upsertProduct({ name: h.name, slug: h.slug, categoryId: pCat['horns'], basePrice: h.price, installable: true });
        if (prod) {
            await upsertVariant({ productId: prod.id, name: 'Default', sku: `${h.slug.toUpperCase()}-DEFAULT`, price: h.price, attributes: {} });
            console.log(`  ✅ ${h.name}`);
        }
    }

    await pause();

    // ── 3.14 VEHICLE-SPECIFIC FOG LAMPS ──────────────────────────────────────
    console.log('\n💡 Vehicle-Specific Fog Lamps...');

    // Compatibility data
    const fogLampCompat = [
        { make: 'Toyota', model: 'Corolla', years: [2010, 2012, 2015, 2018, 2022] },
        { make: 'Honda', model: 'Civic', years: [2005, 2008, 2012, 2018, 2022] },
        { make: 'Honda', model: 'City', years: [2006, 2016, 2022] },
        { make: 'Toyota', model: 'Yaris', years: [2018, 2025] },
    ];

    for (const entry of fogLampCompat) {
        for (const year of entry.years) {
            const productName = `${entry.model} ${year} Fog Lamp`;
            const slug = `fog-lamp-${entry.model.toLowerCase()}-${year}`;
            const prod = await upsertProduct({
                name: productName, slug,
                categoryId: pCat['fog-lamps'],
                basePrice: 3500, installable: true,
                description: `OEM-fit fog lamp for ${entry.make} ${entry.model} ${year}.`,
            });
            if (prod) {
                await upsertVariant({ productId: prod.id, name: 'Default', sku: `${slug.toUpperCase()}-DEFAULT`, price: 3500, attributes: { make: entry.make, model: entry.model, year } });
                await seedCompatibility(prod.id, [{ make: entry.make, model: entry.model, years: [year] }]);
                console.log(`  ✅ ${productName}`);
            }
        }
    }

    // ── 3.15 STEERING LOCKS ───────────────────────────────────────────────────
    console.log('\n🔐 Steering Locks...');
    const steeringLocks = [
        { name: 'Password Steering Lock', slug: 'steering-lock-password', price: 1500 },
        { name: 'Steering Lock Crook', slug: 'steering-lock-crook', price: 1200 },
        { name: 'Luxury Steering Lock', slug: 'steering-lock-luxury', price: 2000 },
    ];
    for (const sl of steeringLocks) {
        const prod = await upsertProduct({ name: sl.name, slug: sl.slug, categoryId: pCat['steering-locks'], basePrice: sl.price });
        if (prod) {
            await upsertVariant({ productId: prod.id, name: 'Default', sku: `${sl.slug.toUpperCase()}-DEFAULT`, price: sl.price, attributes: {} });
            console.log(`  ✅ ${sl.name}`);
        }
    }

    // ── 3.16 STARTING KITS ────────────────────────────────────────────────────
    console.log('\n🔋 Starting Kits...');
    const startingKits = [
        { name: 'Jumpstart Kit 3-in-1', slug: 'jumpstart-kit-3in1', price: 5500 },
        { name: 'Booster Cable 1000A', slug: 'booster-cable-1000a', price: 2200 },
        { name: 'Booster Cable 1200A', slug: 'booster-cable-1200a', price: 2800 },
    ];
    for (const sk of startingKits) {
        const prod = await upsertProduct({ name: sk.name, slug: sk.slug, categoryId: pCat['starting-kits'], basePrice: sk.price });
        if (prod) {
            await upsertVariant({ productId: prod.id, name: 'Default', sku: `${sk.slug.toUpperCase()}-DEFAULT`, price: sk.price, attributes: {} });
            console.log(`  ✅ ${sk.name}`);
        }
    }

    // ── 3.17 MICROFIBER ───────────────────────────────────────────────────────
    console.log('\n🧽 Microfiber...');
    const microfibers = [
        { name: 'Microfiber 40x40 Thick', slug: 'microfiber-40x40-thick', price: 200, attrs: { size: '40x40', type: 'Thick' } },
        { name: 'Microfiber 30x40 Normal', slug: 'microfiber-30x40-normal', price: 150, attrs: { size: '30x40', type: 'Normal' } },
        { name: 'Microfiber 40x60 Quick Dry', slug: 'microfiber-40x60-quickdry', price: 250, attrs: { size: '40x60', type: 'Quick Dry' } },
        { name: 'Microfiber 40x40 Nanowool', slug: 'microfiber-40x40-nanowool', price: 300, attrs: { size: '40x40', type: 'Nanowool' } },
        { name: 'Microfiber 40x80 Normal', slug: 'microfiber-40x80-normal', price: 300, attrs: { size: '40x80', type: 'Normal' } },
    ];
    for (const mf of microfibers) {
        const prod = await upsertProduct({ name: mf.name, slug: mf.slug, categoryId: pCat['microfiber'], basePrice: mf.price });
        if (prod) {
            await upsertVariant({ productId: prod.id, name: 'Default', sku: `${mf.slug.toUpperCase()}-DEFAULT`, price: mf.price, attributes: mf.attrs });
            console.log(`  ✅ ${mf.name}`);
        }
    }

    await pause();

    // ── 3.18 MOBILE CHARGERS ──────────────────────────────────────────────────
    console.log('\n🔌 Mobile Chargers...');
    const charger = await upsertProduct({ name: 'ST Thunder Mobile Charger', slug: 'charger-st-thunder', categoryId: pCat['mobile-chargers'], basePrice: 600 });
    if (charger) {
        await upsertVariant({ productId: charger.id, name: 'Default', sku: 'CHARGER-ST-THUNDER-DEFAULT', price: 600, attributes: {} });
        console.log('  ✅ ST Thunder Mobile Charger');
    }

    // ── 3.19 BRAKE CALIPER COVERS ─────────────────────────────────────────────
    console.log('\n🚗 Brake Caliper Covers...');
    const caliperCover = await upsertProduct({
        name: 'Brembo Brake Caliper Cover', slug: 'brembo-caliper-cover',
        categoryId: pCat['brake-caliper-covers'], basePrice: 2500,
    });
    if (caliperCover) {
        for (const size of ['S', 'M', 'L']) {
            await upsertVariant({
                productId: caliperCover.id, name: size,
                sku: `BREMBO-CALIPER-${size}`,
                price: 2500, attributes: { size },
            });
        }
        console.log('  ✅ Brembo Brake Caliper Cover (S/M/L)');
    }

    // ── 3.20 MATS ─────────────────────────────────────────────────────────────
    console.log('\n🚗 Mats...');
    const mats = [
        { name: 'TPE Car Mats', slug: 'mats-tpe', price: 3500, attrs: { material: 'TPE' } },
        { name: 'Silicone Car Mats', slug: 'mats-silicone', price: 3000, attrs: { material: 'Silicone' } },
        { name: 'Universal Car Mats Set', slug: 'mats-universal-set', price: 2000, attrs: { material: 'Universal' } },
    ];
    for (const m of mats) {
        const prod = await upsertProduct({ name: m.name, slug: m.slug, categoryId: pCat['mats'], basePrice: m.price });
        if (prod) {
            await upsertVariant({ productId: prod.id, name: 'Default', sku: `${m.slug.toUpperCase()}-DEFAULT`, price: m.price, attributes: m.attrs });
            console.log(`  ✅ ${m.name}`);
        }
    }

    // ── 3.21 SIDE SHADES ──────────────────────────────────────────────────────
    console.log('\n🚗 Side Shades...');
    const sideShade = await upsertProduct({ name: 'Side Shades Black', slug: 'side-shades-black', categoryId: pCat['side-shades'], basePrice: 800 });
    if (sideShade) {
        await upsertVariant({ productId: sideShade.id, name: 'Black', sku: 'SIDE-SHADES-BLACK-DEFAULT', price: 800, attributes: { color: 'Black' } });
        console.log('  ✅ Side Shades Black');
    }

    // ── 3.22 TOP COVERS ───────────────────────────────────────────────────────
    console.log('\n🚗 Top Covers...');
    const topCover = await upsertProduct({ name: 'Universal Top Cover', slug: 'top-cover-universal', categoryId: pCat['top-covers'], basePrice: 2500 });
    if (topCover) {
        await upsertVariant({ productId: topCover.id, name: 'Universal', sku: 'TOP-COVER-UNIVERSAL-DEFAULT', price: 2500, attributes: { fitment: 'Universal' } });
        console.log('  ✅ Universal Top Cover');
    }

    await pause();

    // ── 3.23 SPOILERS ─────────────────────────────────────────────────────────
    console.log('\n🚗 Spoilers...');
    const spoilerVehicles = ['Alto', 'Corolla', 'Civic', 'Elantra', 'Wagon R', 'Yaris', 'City'];
    for (const vehicle of spoilerVehicles) {
        const slug = `spoiler-${vehicle.toLowerCase().replace(' ', '-')}`;
        const prod = await upsertProduct({
            name: `${vehicle} Spoiler`, slug,
            categoryId: pCat['spoilers'], basePrice: 5000, installable: true,
        });
        if (prod) {
            await upsertVariant({ productId: prod.id, name: 'Default', sku: `${slug.toUpperCase()}-DEFAULT`, price: 5000, attributes: { vehicle } });
            console.log(`  ✅ ${vehicle} Spoiler`);
        }
    }

    // ── 3.24 SHUTTER LIDS ─────────────────────────────────────────────────────
    console.log('\n🚗 Shutter Lids...');
    const shutterLidVehicles = ['JAC T9', 'Roco', 'Revo GR', 'Vigo', 'BYD Shark'];
    for (const vehicle of shutterLidVehicles) {
        const slug = `shutter-lid-${vehicle.toLowerCase().replace(/\s+/g, '-')}`;
        const prod = await upsertProduct({
            name: `${vehicle} Shutter Lid`, slug,
            categoryId: pCat['shutter-lids'], basePrice: 18000, installable: true,
        });
        if (prod) {
            await upsertVariant({ productId: prod.id, name: 'Default', sku: `${slug.toUpperCase()}-DEFAULT`, price: 18000, attributes: { vehicle } });
            console.log(`  ✅ ${vehicle} Shutter Lid`);
        }
    }

    // ── 3.25 BODY KITS ────────────────────────────────────────────────────────
    console.log('\n🚗 Body Kits...');
    const bodyKitVehicles = ['Corolla', 'Civic', 'City', 'Wagon R', 'Alto', 'Cultus'];
    for (const vehicle of bodyKitVehicles) {
        const slug = `body-kit-${vehicle.toLowerCase().replace(' ', '-')}`;
        const prod = await upsertProduct({
            name: `${vehicle} Body Kit`, slug,
            categoryId: pCat['body-kits'], basePrice: 35000, installable: true, featured: true,
        });
        if (prod) {
            await upsertVariant({ productId: prod.id, name: 'Default', sku: `${slug.toUpperCase()}-DEFAULT`, price: 35000, attributes: { vehicle } });
            console.log(`  ✅ ${vehicle} Body Kit`);
        }
    }

    // ── 3.26 AIR PRESS ────────────────────────────────────────────────────────
    console.log('\n🚗 Air Press...');
    const airPressBrands = [
        { name: 'TXR Air Press', slug: 'air-press-txr', price: 4500 },
        { name: 'Kanglong Air Press', slug: 'air-press-kanglong', price: 4000 },
    ];
    for (const ap of airPressBrands) {
        const prod = await upsertProduct({ name: ap.name, slug: ap.slug, categoryId: pCat['air-press'], basePrice: ap.price, installable: true });
        if (prod) {
            await upsertVariant({ productId: prod.id, name: 'Universal', sku: `${ap.slug.toUpperCase()}-UNIVERSAL`, price: ap.price, attributes: { fitment: 'All Cars' } });
            console.log(`  ✅ ${ap.name}`);
        }
    }

    // ── 3.27 BATMAN COVERS ────────────────────────────────────────────────────
    console.log('\n🚗 Batman Covers...');
    const batmanVehicles = ['Civic', 'Corolla', 'City', 'Yaris'];
    for (const vehicle of batmanVehicles) {
        const slug = `batman-cover-${vehicle.toLowerCase()}`;
        const prod = await upsertProduct({
            name: `${vehicle} Batman Cover`, slug,
            categoryId: pCat['batman-covers'], basePrice: 2500,
        });
        if (prod) {
            await upsertVariant({ productId: prod.id, name: 'Default', sku: `${slug.toUpperCase()}-DEFAULT`, price: 2500, attributes: { vehicle } });
            console.log(`  ✅ ${vehicle} Batman Cover`);
        }
    }

    await pause();

    // ── 3.28 SECURITY SYSTEMS ─────────────────────────────────────────────────
    console.log('\n🔒 Security...');

    const securitySystems = [
        { name: 'Jordon Security System', slug: 'security-jordon', price: 6000 },
        { name: 'Steelmate Security System', slug: 'security-steelmate', price: 8000 },
    ];
    for (const s of securitySystems) {
        const prod = await upsertProduct({ name: s.name, slug: s.slug, categoryId: pCat['security-systems'], basePrice: s.price, installable: true });
        if (prod) {
            await upsertVariant({ productId: prod.id, name: 'Default', sku: `${s.slug.toUpperCase()}-DEFAULT`, price: s.price, attributes: {} });
            console.log(`  ✅ ${s.name}`);
        }
    }

    const keylessEntry = await upsertProduct({ name: 'ST Thunder Keyless Entry', slug: 'keyless-entry-st-thunder', categoryId: pCat['security-systems'], basePrice: 3500, installable: true });
    if (keylessEntry) {
        await upsertVariant({ productId: keylessEntry.id, name: 'Default', sku: 'KEYLESS-ST-THUNDER-DEFAULT', price: 3500, attributes: {} });
        console.log('  ✅ ST Thunder Keyless Entry');
    }

    const centralLockingBrands = [
        { name: 'JS Central Locking', slug: 'central-locking-js', price: 2800 },
        { name: 'Yoko Central Locking', slug: 'central-locking-yoko', price: 2500 },
    ];
    for (const cl of centralLockingBrands) {
        const prod = await upsertProduct({ name: cl.name, slug: cl.slug, categoryId: pCat['security-systems'], basePrice: cl.price, installable: true });
        if (prod) {
            await upsertVariant({ productId: prod.id, name: 'Default', sku: `${cl.slug.toUpperCase()}-DEFAULT`, price: cl.price, attributes: {} });
            console.log(`  ✅ ${cl.name}`);
        }
    }

    // ── 3.29 CAMERAS & FRAMES ─────────────────────────────────────────────────
    console.log('\n📷 Cameras & Frames...');
    const cameras = [
        { name: 'Front Camera Universal', slug: 'camera-front-universal', price: 1500 },
        { name: 'Rear Camera Universal', slug: 'camera-rear-universal', price: 1200 },
        { name: 'Android Frame Universal', slug: 'android-frame-universal', price: 2000 },
    ];
    for (const cam of cameras) {
        const prod = await upsertProduct({ name: cam.name, slug: cam.slug, categoryId: pCat['cameras-frames'], basePrice: cam.price, installable: true });
        if (prod) {
            await upsertVariant({ productId: prod.id, name: 'Universal', sku: `${cam.slug.toUpperCase()}-UNIVERSAL`, price: cam.price, attributes: { fitment: 'Universal' } });
            console.log(`  ✅ ${cam.name}`);
        }
    }

    // ── 3.30 BUMPERS ──────────────────────────────────────────────────────────
    console.log('\n🚘 Bumpers...');
    const bumperVehicles = ['Corolla', 'Revo', 'Prado', 'Land Cruiser', 'Civic'];
    for (const vehicle of bumperVehicles) {
        const slug = `bumper-${vehicle.toLowerCase().replace(' ', '-')}`;
        const prod = await upsertProduct({
            name: `${vehicle} Bumper`, slug,
            categoryId: pCat['bumpers'], basePrice: 25000, installable: true, featured: true,
        });
        if (prod) {
            for (const variant of ['Standard', 'Facelift']) {
                await upsertVariant({
                    productId: prod.id, name: variant,
                    sku: `${slug.toUpperCase()}-${variant.toUpperCase()}`,
                    price: variant === 'Facelift' ? 28000 : 25000,
                    attributes: { vehicle, variant },
                });
            }
            console.log(`  ✅ ${vehicle} Bumper (Standard, Facelift)`);
        }
    }

    // ── 3.31 INTERIOR PPF ─────────────────────────────────────────────────────
    console.log('\n🛡️  Interior PPF...');
    const ppfVehicles = ['Civic', 'Tucson', 'Sportage', 'BMW', 'Haval', 'Sonata'];
    for (const vehicle of ppfVehicles) {
        const slug = `ppf-${vehicle.toLowerCase()}`;
        const prod = await upsertProduct({
            name: `${vehicle} Interior PPF`, slug,
            categoryId: pCat['interior-ppf'], basePrice: 12000, installable: true,
        });
        if (prod) {
            await upsertVariant({ productId: prod.id, name: 'Default', sku: `${slug.toUpperCase()}-DEFAULT`, price: 12000, attributes: { vehicle } });
            console.log(`  ✅ ${vehicle} Interior PPF`);
        }
    }

    // ── 3.32 QUARTER COVERS (placeholder) ────────────────────────────────────
    console.log('\n🚗 Quarter Covers...');
    const quarterCover = await upsertProduct({
        name: 'Vehicle-Specific Quarter Cover', slug: 'quarter-cover-vehicle-specific',
        categoryId: pCat['quarter-covers'], basePrice: 3500,
        description: 'Vehicle-specific quarter panel cover. Select your vehicle when ordering.',
    });
    if (quarterCover) {
        await upsertVariant({ productId: quarterCover.id, name: 'Universal', sku: 'QUARTER-COVER-UNIVERSAL-DEFAULT', price: 3500, attributes: {} });
        console.log('  ✅ Quarter Cover (placeholder — add specific vehicles as needed)');
    }

    // ════════════════════════════════════════════════════════════════════════
    console.log('\n\n🎉 ═══════════════════════════════════════════════');
    console.log('   Allah-Hu-Autos Database Seed COMPLETE!');
    console.log('   ✅ Parent Categories seeded');
    console.log('   ✅ LED Sub-categories seeded');
    console.log('   ✅ All Products seeded');
    console.log('   ✅ All Variants seeded');
    console.log('   ✅ Vehicle Compatibility seeded');
    console.log('═══════════════════════════════════════════════════\n');
}

function pause(ms = 500) {
    return new Promise(r => setTimeout(r, ms));
}

seed().catch(console.error);