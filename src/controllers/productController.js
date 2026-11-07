import { matchedData } from 'express-validator';
import * as Product from '../models/productModel.js';
import * as Terrain from '../models/terrainModel.js';
import { PRODUCT_SORTS } from '../config/constants.js';
import { buildPageUrl } from '../utils/pagination.js';

const PER_PAGE = 8;

// GET /products
export async function index(req, res) {
  const valid = matchedData(req, { locations: ['query'] });

  // Second line of defense: only accept the exact types we expect.
  const filters = {
    q: typeof valid.q === 'string' ? valid.q : '',
    category: typeof valid.category === 'string' ? valid.category : '',
    terrain: typeof valid.terrain === 'string' ? valid.terrain : '',
    brandId: Number.isInteger(valid.brand) ? valid.brand : null,
    sort: PRODUCT_SORTS.includes(valid.sort) ? valid.sort : 'newest',
    page: Number.isInteger(valid.page) ? valid.page : 1,
  };

  const [results, categories, brands, terrains] = await Promise.all([
    Product.search({ ...filters, perPage: PER_PAGE }),
    Product.listCategories(),
    Product.listBrands(),
    Terrain.listWithCounts(),
  ]);

  // The filters to keep in pagination links (page itself is added by pageUrl).
  const linkFilters = {
    q: filters.q,
    category: filters.category,
    terrain: filters.terrain,
    brand: filters.brandId ?? '',
    sort: filters.sort === 'newest' ? '' : filters.sort,
  };

  res.render('products/index', {
    title: 'Shop',
    ...results, // products, total, page, totalPages
    filters,
    categories,
    brands,
    terrains,
    pageUrl: buildPageUrl('/products', linkFilters),
  });
}
