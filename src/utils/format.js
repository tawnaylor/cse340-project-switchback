const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// 15999 -> "$159.99"
export function formatPrice(cents) {
  return cents == null ? '' : currency.format(cents / 100);
}

// -> "Dec 12, 2026"
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// -> "Dec"
export function monthShort(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short' });
}

// -> 12
export function dayOfMonth(date) {
  return new Date(date).getDate();
}
