import pool from '../config/db.js';

// Every terrain tag with how many products and upcoming races use it.
export async function listWithCounts() {
  const { rows } = await pool.query(
    `SELECT t.id, t.name, t.slug,
            (SELECT COUNT(*)::int
               FROM product_terrain_tags pt
               JOIN products p ON p.id = pt.product_id
              WHERE pt.terrain_tag_id = t.id AND p.is_active = TRUE) AS product_count,
            (SELECT COUNT(*)::int
               FROM race_terrain_tags rt
               JOIN races r ON r.id = rt.race_id
              WHERE rt.terrain_tag_id = t.id
                AND r.status = 'published'
                AND r.race_date >= CURRENT_DATE) AS race_count
     FROM terrain_tags t
     ORDER BY t.id`
  );
  return rows;
}
