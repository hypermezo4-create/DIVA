import {catalogProducts} from '@/features/catalog/catalog';
import type {CatalogFilter} from '@/features/catalog/types';
import type {AppLocale} from '@/i18n/routing';

const demoCommerce = {
  'milano-court-01': {priceMinor: 18900, compareAtMinor: 22900, sku: 'MILANO01'},
  'aurelia-08': {priceMinor: 22900, compareAtMinor: null, sku: 'AURELIA08'},
  'noir-loafer-03': {priceMinor: 21500, compareAtMinor: null, sku: 'NOIR03'},
  'celeste-line-02': {priceMinor: 17900, compareAtMinor: 20900, sku: 'CELESTE02'},
  'junior-court-05': {priceMinor: 12900, compareAtMinor: null, sku: 'JUNIOR05'},
  'mini-mirror-04': {priceMinor: 14900, compareAtMinor: 17900, sku: 'MINI04'}
} as const;

const collectionNames = {
  mirror: {en: 'The Mirror Edition', ar: 'مجموعة المرآة', de: 'The Mirror Edition', ru: 'The Mirror Edition'},
  city: {en: 'The City Edit', ar: 'اختيارات المدينة', de: 'The City Edit', ru: 'The City Edit'}
} as const;

function matchesFilter(product: (typeof catalogProducts)[number], filter: CatalogFilter) {
  if (filter === 'all') return true;
  if (filter === 'offers') {
    const pricing = demoCommerce[product.slug];
    return pricing.compareAtMinor !== null && pricing.compareAtMinor > pricing.priceMinor;
  }
  return product.audience === filter;
}

export function listFallbackProducts(locale: AppLocale, filter: CatalogFilter) {
  return catalogProducts
    .filter((product) => matchesFilter(product, filter))
    .map((product) => {
      const copy = product.copy[locale];
      const pricing = demoCommerce[product.slug];
      return {
        id: `fallback-${product.slug}`,
        slug: product.slug,
        audience: product.audience,
        family: product.family,
        newArrival: product.newArrival,
        collection: product.collection,
        collectionName: product.collection ? collectionNames[product.collection][locale] : null,
        name: copy.name,
        subtitle: copy.subtitle,
        image: product.image,
        priceMinor: pricing.priceMinor,
        compareAtMinor: pricing.compareAtMinor,
        currency: 'USD',
        available: 1
      };
    });
}

export function findFallbackProduct(locale: AppLocale, slug: string) {
  const product = catalogProducts.find((candidate) => candidate.slug === slug);
  if (!product) return null;

  const copy = product.copy[locale];
  const pricing = demoCommerce[product.slug];
  const variants = product.colors.flatMap((color, colorIndex) => product.sizes.map((size) => ({
    id: `fallback-${product.slug}-${colorIndex}-${size}`,
    sku: `${pricing.sku}-PREVIEW-${colorIndex}-${size}`,
    priceMinor: pricing.priceMinor,
    compareAtMinor: pricing.compareAtMinor,
    currency: 'USD',
    size,
    colorCode: `preview-${colorIndex}`,
    colorHex: color.hex,
    colorLabel: color.label[locale],
    onHand: 1,
    reserved: 0,
    available: 1
  })));

  return {
    id: `fallback-${product.slug}`,
    slug: product.slug,
    audience: product.audience,
    family: product.family,
    newArrival: product.newArrival,
    collection: product.collection,
    collectionName: product.collection ? collectionNames[product.collection][locale] : null,
    name: copy.name,
    subtitle: copy.subtitle,
    description: copy.description,
    images: product.gallery.map((url, index) => ({url, altText: index === 0 ? copy.name : null})),
    variants,
    commerceEnabled: false
  };
}

export function listFallbackSitemapEntries() {
  const updatedAt = new Date();
  return catalogProducts.map((product) => ({slug: product.slug, updatedAt}));
}
