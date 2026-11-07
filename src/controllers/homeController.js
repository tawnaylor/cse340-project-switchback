import * as Race from '../models/raceModel.js';
import * as Product from '../models/productModel.js';
import * as Terrain from '../models/terrainModel.js';

export async function index(req, res) {
  // The three queries do not depend on each other, so run them together.
  const [races, products, terrains] = await Promise.all([
    Race.getUpcoming(3),
    Product.getFeatured(4),
    Terrain.listWithCounts(),
  ]);

  res.render('pages/home', {
    title: 'Trail races and gear',
    races,
    products,
    terrains,
  });
}
