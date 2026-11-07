import pool from '../config/db.js';

// Featured products first (admin controls is_featured), then newest.
export async function getFeatured(limit = 4) {
  const { rows } = await pool.query(
    `SELECT p.id, p.name, p.price_cents, p.image_url,
            b.name AS brand_name,
            c.name AS category_name,
            (SELECT COALESCE(ARRAY_AGG(t.name ORDER BY t.name), '{}')
               FROM product_terrain_tags pt
               JOIN terrain_tags t ON t.id = pt.terrain_tag_id
              WHERE pt.product_id = p.id) AS terrain
     FROM products p
     JOIN categories c ON c.id = p.category_id
     LEFT JOIN brands b ON b.id = p.brand_id
     WHERE p.is_active = TRUE
     ORDER BY p.is_featured DESC, p.id ASC
     LIMIT $1`,
    [limit]
  );
  return rows;
}
