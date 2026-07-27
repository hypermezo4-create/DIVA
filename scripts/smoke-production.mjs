const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3000';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path) {
  const response = await fetch(new URL(path, baseUrl), {redirect: 'manual'});
  assert(response.ok, `${path} returned ${response.status}`);
  return response;
}

async function crossSiteMutation(path, method = 'POST') {
  return fetch(new URL(path, baseUrl), {
    method,
    redirect: 'manual',
    headers: {
      origin: 'https://attacker.example',
      'sec-fetch-site': 'cross-site',
      'content-type': 'application/json'
    },
    body: '{}'
  });
}

const health = await request('/api/health');
const healthBody = await health.json();
assert(healthBody.status === 'ok' && healthBody.database === 'ok', 'Health endpoint did not report a ready database.');
assert(health.headers.get('cache-control')?.includes('no-store'), 'Health endpoint must not be cached.');
assert(health.headers.get('x-robots-tag')?.includes('noindex'), 'API responses must not be indexed.');

const home = await request('/en');
for (const header of [
  'content-security-policy',
  'strict-transport-security',
  'cross-origin-opener-policy',
  'cross-origin-resource-policy',
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
  'permissions-policy'
]) {
  assert(home.headers.has(header), `Missing security header: ${header}`);
}
assert(home.headers.get('content-security-policy')?.includes("frame-ancestors 'none'"), 'CSP must prevent framing.');

const homeHtml = await home.text();
assert(homeHtml.includes('application/ld+json'), 'Home page is missing structured data.');
assert(homeHtml.includes('rel="canonical"'), 'Home page is missing canonical metadata.');
assert(homeHtml.includes('hreflang="ar"'), 'Home page is missing Arabic language alternate metadata.');
assert(homeHtml.includes('hreflang="x-default"'), 'Home page is missing x-default language alternate metadata.');
assert(homeHtml.includes('<main'), 'Home page is missing its main landmark.');
assert(homeHtml.includes('<h1'), 'Home page is missing its primary heading.');

const arabic = await request('/ar');
const arabicHtml = await arabic.text();
assert(arabicHtml.includes('lang="ar"'), 'Arabic storefront must declare the Arabic document language.');
assert(arabicHtml.includes('dir="rtl"'), 'Arabic storefront must declare RTL document direction.');

const shop = await request('/en/shop');
const shopHtml = await shop.text();
assert(shopHtml.includes('rel="canonical"'), 'Shop page is missing canonical metadata.');

const product = await request('/en/product/milano-court-01');
const productHtml = await product.text();
assert(productHtml.includes('application/ld+json'), 'Product page is missing structured data.');
assert(productHtml.includes('Milano Court 01'), 'Seeded product page did not render expected product content.');
assert(productHtml.includes('rel="canonical"'), 'Product page is missing canonical metadata.');

const cart = await request('/en/cart');
const cartHtml = await cart.text();
assert(cartHtml.includes('noindex'), 'Private cart route must emit noindex metadata.');

const robots = await request('/robots.txt');
const robotsText = await robots.text();
assert(robotsText.includes('Sitemap:'), 'robots.txt is missing the sitemap declaration.');
assert(robotsText.includes('Disallow: /api/'), 'robots.txt must exclude API routes.');
assert(robotsText.includes('/*/admin'), 'robots.txt must exclude admin routes.');

const sitemap = await request('/sitemap.xml');
const sitemapText = await sitemap.text();
assert(sitemapText.includes('/en/shop'), 'Sitemap is missing the English shop route.');
assert(sitemapText.includes('/ar/shop'), 'Sitemap is missing the Arabic shop route.');
assert(sitemapText.includes('/en/product/milano-court-01'), 'Sitemap is missing active product routes.');

const checkoutAttack = await crossSiteMutation('/api/checkout');
assert(checkoutAttack.status === 403, `Cross-site checkout should return 403, got ${checkoutAttack.status}.`);

const adminAttack = await crossSiteMutation('/api/admin/products/00000000-0000-0000-0000-000000000000', 'PATCH');
assert(adminAttack.status === 403, `Cross-site admin mutation should return 403, got ${adminAttack.status}.`);

console.log('Production runtime smoke passed: health, headers, public SEO, product indexing, accessibility landmarks, crawl policy and cross-site mutation guards.');
