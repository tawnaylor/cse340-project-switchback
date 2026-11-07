import pool from '../config/db.js';

// Every query is parameterized. Filter values go in as $1, $2, ... and the only
// text built into SQL is picked from fixed lists below (never from user input).

const SORTS = {
  newest: 'p.id DESC',
  'price-asc': 'p.price_cents ASC, p.id ASC',
  'price-desc': 'p.price_cents DESC, p.id ASC',
  name: 'p.name ASC',
};

const BASE_FROM = `
  FROM products p
  JOIN categories c ON c.id = p.category_id
  LEFT JOIN brands b ON b.id = p.brand_id`;

// Everything a product card needs.
const CARD_COLUMNS = `
  p.id, p.name, p.price_cents, p.image_url, p.is_featured,
  b.name AS brand_name,
  c.name AS category_name,
  (SELECT COALESCE(ARRAY_AGG(t.name ORDER BY t.name), '{}')
     FROM product_terrain_tags pt
     JOIN terrain_tags t ON t.id = pt.terrain_tag_id
    WHERE pt.product_id = p.id) AS terrain,
  (SELECT ROUND(AVG(r.rating), 1)::float
     FROM product_reviews r WHERE r.product_id = p.id) AS avg_rating,
  (SELECT COUNT(*)::int
     FROM product_reviews r WHERE r.product_id = p.id) AS review_count,
  EXISTS (SELECT 1 FROM product_variants v
           WHERE v.product_id = p.id AND v.stock > 0) AS in_stock`;

// Makes % and _ in a search term match literally instead of acting as wildcards.
const escapeLike = (text) => text.replace(/[\\%_]/g, '\\$&');

// Featured products first (admin controls is_featured), then oldest first.
export async function getFeatured(limit = 4) {
  const { rows } = await pool.query(
    `SELECT ${CARD_COLUMNS} ${BASE_FROM}
     WHERE p.is_active = TRUE
     ORDER BY p.is_featured DESC, p.id ASC
     LIMIT $1`,
    [limit]
  );
  return rows;
}

// The shop page: filter, sort, and paginate.
export async function search({ q, category, terrain, brandId, sort = 'newest', page = 1, perPage = 8 }) {
  const where = ['p.is_active = TRUE'];
  const params = [];
  const add = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (q) {
    const like = add(`%${escapeLike(q)}%`);
    where.push(`(p.name ILIKE ${like} OR p.description ILIKE ${like} OR b.name ILIKE ${like})`);
  }
  if (category) where.push(`c.slug = ${add(category)}`);
  if (terrain) {
    where.push(`EXISTS (
      SELECT 1 FROM product_terrain_tags pt
      JOIN terrain_tags t ON t.id = pt.terrain_tag_id
      WHERE pt.product_id = p.id AND t.slug = ${add(terrain)})`);
  }
  if (brandId) where.push(`p.brand_id = ${add(brandId)}`);

  const whereSql = `WHERE ${where.join(' AND ')}`;

  const countResult = await pool.query(`SELECT COUNT(*)::int AS total ${BASE_FROM} ${whereSql}`, params);
  const total = countResult.rows[0].total;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const orderSql = SORTS[sort] ?? SORTS.newest;
  const limitPlaceholder = add(perPage);
  const offsetPlaceholder = add((safePage - 1) * perPage);

  const { rows } = await pool.query(
    `SELECT ${CARD_COLUMNS} ${BASE_FROM}
     ${whereSql}
     ORDER BY ${orderSql}
     LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
    params
  );

  return { products: rows, total, page: safePage, totalPages };
}

// Options for the filter dropdowns.
export async function listCategories() {
  const { rows } = await pool.query(
    `SELECT c.id, c.name, c.slug, COUNT(p.id)::int AS product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id AND p.is_active = TRUE
     GROUP BY c.id
     ORDER BY c.id`
  );
  return rows;
}

export async function listBrands() {
  const { rows } = await pool.query(
    `SELECT b.id, b.name, COUNT(p.id)::int AS product_count
     FROM brands b
     LEFT JOIN products p ON p.brand_id = b.id AND p.is_active = TRUE
     GROUP BY b.id
     ORDER BY b.name`
  );
  return rows;
}
