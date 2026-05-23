// migrate-car-modification.js
// node migrate-car-modification.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  console.log('\n🚀 Migrating to Car Modification & Styling...\n');

  // ── STEP 1: Create parent ─────────────────────────────────────────
  const { data: parent, error: e1 } = await supabase
    .from('categories')
    .upsert({
      name: 'Car Modification & Styling',
      slug: 'car-modification-styling',
      icon: '🚘',
      featured: true,
      image_url: 'https://placehold.co/500x400?text=Car+Modification',
      parent_id: null,
      sort_order: 27,
    }, { onConflict: 'slug' })
    .select().single();

  if (e1) { console.error('❌ Parent:', e1.message); return; }
  console.log('✅ Parent created:', parent.id);

  // ── STEP 2: Create three subcategories ───────────────────────────
  const subDefs = [
    { name: 'Body Parts',   slug: 'body-parts',   icon: '🚗', sort_order: 1 },
    { name: 'Protection',   slug: 'protection',   icon: '🛡️', sort_order: 2 },
    { name: 'Accessories',  slug: 'car-mod-accessories', icon: '🔧', sort_order: 3 },
  ];

  const subs = {};
  for (const def of subDefs) {
    const { data, error } = await supabase
      .from('categories')
      .upsert({
        ...def,
        featured: false,
        image_url: `https://placehold.co/500x400?text=${encodeURIComponent(def.name)}`,
        parent_id: parent.id,
      }, { onConflict: 'slug' })
      .select().single();

    if (error) { console.error(`❌ ${def.name}:`, error.message); return; }
    subs[def.slug] = data;
    console.log(`✅ Subcategory: ${def.name} (${data.id})`);
  }

  // ── STEP 3: Move products from old categories → new subcategories ─
  const moves = [
    { oldSlugs: ['bumpers', 'body-kits', 'spoilers', 'shutter-lids'], newCatId: subs['body-parts'].id,   label: 'Body Parts' },
    { oldSlugs: ['interior-ppf'],                                      newCatId: subs['protection'].id,   label: 'Protection' },
  ];

  console.log('\n📦 Moving products...');
  for (const move of moves) {
    // Get IDs of old categories
    const { data: oldCats, error: fetchErr } = await supabase
      .from('categories')
      .select('id, name, slug')
      .in('slug', move.oldSlugs);

    if (fetchErr || !oldCats?.length) {
      console.warn(`  ⚠️  Could not find categories: ${move.oldSlugs.join(', ')}`);
      continue;
    }

    const oldIds = oldCats.map(c => c.id);

    // Reassign all products from old category IDs → new subcategory
    const { count, error: updateErr } = await supabase
      .from('products')
      .update({ category_id: move.newCatId })
      .in('category_id', oldIds);

    if (updateErr) {
      console.error(`  ❌ Moving to ${move.label}:`, updateErr.message);
    } else {
      console.log(`  ✅ → ${move.label}: moved products from [${oldCats.map(c => c.name).join(', ')}]`);
    }
  }

  // ── STEP 4: Delete old categories (products already moved) ────────
  const oldSlugsToDelete = ['bumpers', 'body-kits', 'spoilers', 'shutter-lids', 'interior-ppf'];

  console.log('\n🗑️  Deleting old categories...');
  for (const slug of oldSlugsToDelete) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('slug', slug);

    if (error) {
      console.error(`  ❌ Delete ${slug}:`, error.message);
    } else {
      console.log(`  ✅ Deleted: ${slug}`);
    }
  }

  // ── STEP 5: Verify ────────────────────────────────────────────────
  console.log('\n🔍 Verifying product counts in new categories...');
  for (const [slug, cat] of Object.entries(subs)) {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', cat.id);
    console.log(`  📂 ${cat.name}: ${count ?? 0} products`);
  }

  console.log('\n🎉 Done! Old categories deleted, products migrated.\n');
}

migrate().catch(console.error);