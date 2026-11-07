import pool from '../config/db.js';

// The next published races, soonest first.
export async function getUpcoming(limit = 3) {
  const { rows } = await pool.query(
    `SELECT r.id, r.name, r.race_date, r.city, r.state, r.difficulty,
            r.elevation_gain_ft, r.image_url,
            (SELECT MIN(d.price_cents)
               FROM race_distances d
              WHERE d.race_id = r.id) AS min_price_cents,
            (SELECT COALESCE(ARRAY_AGG(d.label ORDER BY d.distance_km), '{}')
               FROM race_distances d
              WHERE d.race_id = r.id) AS distance_labels,
            (SELECT COALESCE(ARRAY_AGG(t.name ORDER BY t.name), '{}')
               FROM race_terrain_tags rt
               JOIN terrain_tags t ON t.id = rt.terrain_tag_id
              WHERE rt.race_id = r.id) AS terrain
     FROM races r
     WHERE r.status = 'published' AND r.race_date >= CURRENT_DATE
     ORDER BY r.race_date ASC, r.id ASC
     LIMIT $1`,
    [limit]
  );
  return rows;
}
