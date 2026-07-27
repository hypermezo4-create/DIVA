import 'server-only';

import {and, asc, eq, isNotNull, type SQL} from 'drizzle-orm';
import {getDatabase} from '@/db/client';
import {
  collections,
  colors,
  colorTranslations,
  inventory,
  productImages,
  productTranslations,
  products,
  productVariants,
  sizes
} from '@/db/schema';
import type {AppLocale} from '@/i18n/routing';
import type {CatalogFilter} from '../types';

function filterCondition(filter: CatalogFilter): SQL | undefined {
  if (filter === 'all') return undefined;
  if (filter === 'new') return eq(products.newArrival, true);
  if (filter === 'collections') return isNotNull(products.collectionId);
  return eq(products.audience, filter);
}

export async function listActiveProducts(locale: AppLocale, filter: CatalogFilter = 'all') {
  const db = getDatabase();

  return db
    .select({
      id: products.id,
      slug: products.slug,
      audience: products.audience,
      family: products.family,
      newArrival: products.newArrival,
      collection: collections.slug,
      name: productTranslations.name,
      subtitle: productTranslations.subtitle
    })
    .from(products)
    .innerJoin(
      productTranslations,
      and(eq(productTranslations.productId, products.id), eq(productTranslations.locale, locale))
    )
    .leftJoin(collections, eq(collections.id, products.collectionId))
    .where(and(eq(products.status, 'active'), filterCondition(filter)))
    .orderBy(asc(productTranslations.name));
}

export async function findActiveProduct(locale: AppLocale, slug: string) {
  const db = getDatabase();
  const [product] = await db
    .select({
      id: products.id,
      slug: products.slug,
      audience: products.audience,
      family: products.family,
      newArrival: products.newArrival,
      collection: collections.slug,
      name: productTranslations.name,
      subtitle: productTranslations.subtitle,
      description: productTranslations.description
    })
    .from(products)
    .innerJoin(
      productTranslations,
      and(eq(productTranslations.productId, products.id), eq(productTranslations.locale, locale))
    )
    .leftJoin(collections, eq(collections.id, products.collectionId))
    .where(and(eq(products.slug, slug), eq(products.status, 'active')))
    .limit(1);

  if (!product) return null;

  const [images, variants] = await Promise.all([
    listProductImages(product.id),
    listProductVariants(product.id, locale)
  ]);

  return {...product, images, variants};
}

async function listProductImages(productId: string) {
  return getDatabase()
    .select({url: productImages.url, altText: productImages.altText})
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(asc(productImages.sortOrder));
}

async function listProductVariants(productId: string, locale: AppLocale) {
  const rows = await getDatabase()
    .select({
      id: productVariants.id,
      sku: productVariants.sku,
      priceMinor: productVariants.priceMinor,
      compareAtMinor: productVariants.compareAtMinor,
      currency: productVariants.currency,
      size: sizes.label,
      colorCode: colors.code,
      colorHex: colors.hex,
      colorLabel: colorTranslations.label,
      onHand: inventory.onHand,
      reserved: inventory.reserved
    })
    .from(productVariants)
    .innerJoin(sizes, eq(sizes.id, productVariants.sizeId))
    .innerJoin(colors, eq(colors.id, productVariants.colorId))
    .innerJoin(
      colorTranslations,
      and(eq(colorTranslations.colorId, colors.id), eq(colorTranslations.locale, locale))
    )
    .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
    .where(and(eq(productVariants.productId, productId), eq(productVariants.active, true)))
    .orderBy(asc(sizes.sortOrder));

  return rows.map((row) => ({
    ...row,
    available: Math.max(0, (row.onHand ?? 0) - (row.reserved ?? 0))
  }));
}
