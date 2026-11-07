// Returns a function that builds a link to page N while keeping the current filters.
//   const pageUrl = buildPageUrl('/products', { terrain: 'rocky', sort: 'name' });
//   pageUrl(2) -> "/products?terrain=rocky&sort=name&page=2"
export function buildPageUrl(basePath, filters) {
  return (page) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') params.set(key, value);
    }
    if (page > 1) params.set('page', page);
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };
}
