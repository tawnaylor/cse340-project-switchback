import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool from '../config/db.js';

// Sample products and races so the homepage has something to show.
// Safe to run more than once: anything that already exists (matched by name) is skipped.
// Run `npm run db:seed` first so the brands, categories, tags, and director account exist.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGE_ROOT = path.join(__dirname, '..', '..', 'public', 'images');
const DIRECTOR_EMAIL = 'director@switchback.test';

// If you save an image as public/images/products/<slug>.webp (or .jpg/.png) and
// re-run this script, the product picks it up automatically. Same for races.
function findImage(folder, slug) {
  for (const ext of ['webp', 'jpg', 'jpeg', 'png']) {
    if (fs.existsSync(path.join(IMAGE_ROOT, folder, `${slug}.${ext}`))) {
      return `/images/${folder}/${slug}.${ext}`;
    }
  }
  return null;
}

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const makeSku = (slug, size) =>
  `${slug}-${size}`.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/-$/, '');

const SHOE_SIZES = ['7', '8', '9', '10', '11', '12'];
const SML = ['S', 'M', 'L'];

const products = [
  {
    slug: 'ridgeback-talus-pro', name: 'Ridgeback Talus Pro', brand: 'Ridgeback', category: 'trail-shoes',
    price: 15999, drop: 6, lug: 5.0, weight: 10.4, color: 'Forest / Clay', sizes: SHOE_SIZES, featured: true,
    terrain: ['rocky', 'technical', 'alpine'],
    description: 'Aggressive multi-directional lugs, a rock plate, and a protective toe bumper for loose, rocky climbs and descents.',
  },
  {
    slug: 'ridgeback-mudline', name: 'Ridgeback Mudline', brand: 'Ridgeback', category: 'trail-shoes',
    price: 14999, drop: 6, lug: 6.0, weight: 10.8, color: 'Charcoal / Orange', sizes: SHOE_SIZES, featured: false,
    terrain: ['muddy', 'technical'],
    description: 'Deep, widely spaced lugs that shed mud, with a tough upper built for wet spring and fall races.',
  },
  {
    slug: 'ridgeback-alpine-crest', name: 'Ridgeback Alpine Crest', brand: 'Ridgeback', category: 'trail-shoes',
    price: 17499, drop: 4, lug: 5.5, weight: 10.9, color: 'Slate / Sand', sizes: SHOE_SIZES, featured: false,
    terrain: ['alpine', 'rocky'],
    description: 'A stable, low-drop shoe with sticky rubber for steep, exposed ridgelines.',
  },
  {
    slug: 'juniper-tempo-glide', name: 'Juniper Tempo Glide', brand: 'Juniper Labs', category: 'trail-shoes',
    price: 13999, drop: 8, lug: 3.0, weight: 8.9, color: 'Sage / Cream', sizes: SHOE_SIZES, featured: true,
    terrain: ['groomed', 'mixed'],
    description: 'Light, quick, and smooth. Shallow lugs make this the pick for fast, groomed trails and gravel paths.',
  },
  {
    slug: 'juniper-cloudpath-max', name: 'Juniper Cloudpath Max', brand: 'Juniper Labs', category: 'trail-shoes',
    price: 16999, drop: 6, lug: 3.5, weight: 9.9, color: 'Sand / Clay', sizes: SHOE_SIZES, featured: false,
    terrain: ['groomed', 'desert'],
    description: 'Maximum cushioning for long, runnable miles on dry, hard-packed trails.',
  },
  {
    slug: 'cairn-summit-vest-8l', name: 'Cairn Summit Vest 8L', brand: 'Cairn Outdoor', category: 'packs-vests',
    price: 11999, color: 'Forest', sizes: SML, featured: true,
    terrain: ['mixed', 'alpine', 'technical'],
    description: 'An 8 liter running vest with two soft flask pockets, stretch mesh, and a pole attachment.',
  },
  {
    slug: 'cairn-handheld-flask-500', name: 'Cairn Handheld Flask 500', brand: 'Cairn Outdoor', category: 'hydration',
    price: 3400, color: 'Clay', sizes: ['One Size'], featured: false,
    terrain: ['groomed', 'mixed', 'desert'],
    description: 'A soft 500 ml flask with an adjustable hand strap and a zippered pocket for gels and keys.',
  },
  {
    slug: 'talus-trail-headlamp-400', name: 'Talus Trail Headlamp 400', brand: 'Talus Gear', category: 'lighting',
    price: 4900, color: 'Black / Orange', sizes: ['One Size'], featured: true,
    terrain: ['technical', 'alpine', 'mixed'],
    description: 'A rechargeable 400 lumen headlamp with a bounce-free strap, made for early starts and night miles.',
  },
  {
    slug: 'talus-merino-crew-socks', name: 'Talus Merino Crew Socks', brand: 'Talus Gear', category: 'socks',
    price: 1800, color: 'Sand / Forest', sizes: SML, featured: false,
    terrain: ['mixed', 'muddy', 'groomed'],
    description: 'Cushioned merino blend crew socks that stay comfortable when your feet get wet.',
  },
  {
    slug: 'talus-carbon-folding-poles', name: 'Talus Carbon Folding Poles', brand: 'Talus Gear', category: 'poles',
    price: 13900, color: 'Green / Orange', sizes: ['110 cm', '120 cm', '130 cm'], featured: false,
    terrain: ['alpine', 'technical', 'rocky'],
    description: 'Ultralight carbon poles that fold down small enough to stash in your vest.',
  },
  {
    slug: 'talus-low-gaiters', name: 'Talus Low Gaiters', brand: 'Talus Gear', category: 'accessories',
    price: 2900, color: 'Charcoal', sizes: SML, featured: false,
    terrain: ['desert', 'muddy'],
    description: 'Low-profile gaiters that keep sand, grit, and mud out of your shoes.',
  },
];

const races = [
  {
    slug: 'bountiful-peak-ridge-run', name: 'Bountiful Peak Ridge Run',
    inDays: 28, start: '07:00', location: 'Davis County Trailhead', city: 'Bountiful', state: 'UT',
    difficulty: 'hard', gain: 6200, terrain: ['rocky', 'alpine', 'technical'],
    description: 'A steep, scenic ridgeline run with big views of the valley and the Great Salt Lake.',
    distances: [
      { label: '10K', km: 10, price: 5500, capacity: 150, cutoff: 3 },
      { label: '25K', km: 25, price: 8500, capacity: 100, cutoff: 7 },
      { label: '50K', km: 50, price: 12500, capacity: 60, cutoff: 12 },
    ],
  },
  {
    slug: 'salt-flats-sunrise-trail-run', name: 'Salt Flats Sunrise Trail Run',
    inDays: 52, start: '06:30', location: 'Skull Valley Loop', city: 'Tooele', state: 'UT',
    difficulty: 'easy', gain: 450, terrain: ['desert', 'groomed'],
    description: 'A fast, flat sunrise run on hard-packed desert trails. A great first trail race.',
    distances: [
      { label: '5K', km: 5, price: 3500, capacity: 200, cutoff: 1.5 },
      { label: '10K', km: 10, price: 4500, capacity: 200, cutoff: 2.5 },
      { label: 'Half Marathon', km: 21.1, price: 6500, capacity: 150, cutoff: 4 },
    ],
  },
  {
    slug: 'cottonwood-mud-and-mountains', name: 'Cottonwood Canyon Mud & Mountains',
    inDays: 90, start: '08:00', location: 'Cottonwood Canyon Park', city: 'Salt Lake City', state: 'UT',
    difficulty: 'moderate', gain: 3100, terrain: ['muddy', 'technical', 'mixed'],
    description: 'Creek crossings, roots, and rolling singletrack. Expect to finish with muddy shoes.',
    distances: [
      { label: '10K', km: 10, price: 5000, capacity: 180, cutoff: 3 },
      { label: 'Half Marathon', km: 21.1, price: 7500, capacity: 140, cutoff: 5 },
      { label: 'Marathon', km: 42.2, price: 10500, capacity: 80, cutoff: 9 },
    ],
  },
  {
    slug: 'moab-red-rock-rambler', name: 'Moab Red Rock Rambler',
    inDays: 130, start: '07:30', location: 'Slickrock Trailhead', city: 'Moab', state: 'UT',
    difficulty: 'hard', gain: 4800, terrain: ['desert', 'rocky', 'technical'],
    description: 'Slickrock, sand, and sandstone ledges through iconic red rock country.',
    distances: [
      { label: '15K', km: 15, price: 6500, capacity: 120, cutoff: 4 },
      { label: '30K', km: 30, price: 9500, capacity: 90, cutoff: 8 },
    ],
  },
  {
    slug: 'front-range-fall-colors-15k', name: 'Front Range Fall Colors 15K',
    inDays: 175, start: '08:30', location: 'Golden Gate Canyon Trails', city: 'Golden', state: 'CO',
    difficulty: 'moderate', gain: 1900, terrain: ['mixed', 'groomed'],
    description: 'A smooth, rolling loop through aspen groves, timed for peak color.',
    distances: [
      { label: '8K', km: 8, price: 4000, capacity: 150, cutoff: 2 },
      { label: '15K', km: 15, price: 5500, capacity: 150, cutoff: 3.5 },
    ],
  },
];

async function seedProducts(client) {
  let added = 0;

  for (const [index, p] of products.entries()) {
    const image = findImage('products', p.slug);
    const existing = await client.query('SELECT id FROM products WHERE name = $1', [p.name]);

    if (existing.rowCount > 0) {
      if (image) {
        await client.query('UPDATE products SET image_url = $1 WHERE id = $2 AND image_url IS NULL', [image, existing.rows[0].id]);
      }
      continue;
    }

    const { rows } = await client.query(
      `INSERT INTO products
         (brand_id, category_id, name, description, price_cents, image_url,
          drop_mm, lug_depth_mm, weight_oz, is_featured)
       VALUES
         ((SELECT id FROM brands WHERE name = $1),
          (SELECT id FROM categories WHERE slug = $2),
          $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [p.brand, p.category, p.name, p.description, p.price, image,
       p.drop ?? null, p.lug ?? null, p.weight ?? null, p.featured]
    );
    const productId = rows[0].id;

    await client.query(
      `INSERT INTO product_terrain_tags (product_id, terrain_tag_id)
       SELECT $1::int, id FROM terrain_tags WHERE slug = ANY($2::varchar[])`,
      [productId, p.terrain]
    );

    for (const [i, size] of p.sizes.entries()) {
      const stock = 2 + ((i * 5 + index * 3) % 9);
      await client.query(
        `INSERT INTO product_variants (product_id, size, color, sku, stock)
         VALUES ($1, $2, $3, $4, $5)`,
        [productId, size, p.color, makeSku(p.slug, size), stock]
      );
    }
    added++;
  }
  return added;
}

async function seedRaces(client) {
  let added = 0;

  for (const r of races) {
    const image = findImage('races', r.slug);
    const existing = await client.query('SELECT id FROM races WHERE name = $1', [r.name]);

    if (existing.rowCount > 0) {
      if (image) {
        await client.query('UPDATE races SET image_url = $1 WHERE id = $2 AND image_url IS NULL', [image, existing.rows[0].id]);
      }
      continue;
    }

    const { rows } = await client.query(
      `INSERT INTO races
         (director_id, name, description, race_date, start_time, location_name,
          city, state, difficulty, elevation_gain_ft, registration_deadline, status, image_url)
       VALUES
         ((SELECT id FROM users WHERE email = $1),
          $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'published', $12)
       RETURNING id`,
      [DIRECTOR_EMAIL, r.name, r.description, daysFromNow(r.inDays), r.start, r.location,
       r.city, r.state, r.difficulty, r.gain, daysFromNow(r.inDays - 7), image]
    );
    const raceId = rows[0].id;

    await client.query(
      `INSERT INTO race_terrain_tags (race_id, terrain_tag_id)
       SELECT $1::int, id FROM terrain_tags WHERE slug = ANY($2::varchar[])`,
      [raceId, r.terrain]
    );

    for (const d of r.distances) {
      await client.query(
        `INSERT INTO race_distances (race_id, label, distance_km, price_cents, capacity, cutoff_hours)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [raceId, d.label, d.km, d.price, d.capacity, d.cutoff]
      );
    }
    added++;
  }
  return added;
}

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const productsAdded = await seedProducts(client);
    const racesAdded = await seedRaces(client);
    await client.query('COMMIT');
    console.log(`Catalog seed complete. Added ${productsAdded} products and ${racesAdded} races.`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

try {
  await run();
} catch (err) {
  console.error('Catalog seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
