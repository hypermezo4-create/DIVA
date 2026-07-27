import 'server-only';

import {cache} from 'react';
import {and, asc, eq, sql, type SQL} from 'drizzle-orm';
import {getDatabase} from '@/db/client';
import {
  collections,
  collectionTranslations,
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
import {
  findFallbackProduct,
  listFallbackProducts,
  listFallbackSitemapEntries
} from './catalog-fallback';
import type {CatalogFilter} from '../types';

function hasDatabaseConfiguration() {
  return Boolean(process.env.DATABASE_URL);
}

function filterCondition(filter: CatalogFilter): SQL | undefined {
  if (filter === 'all') return undefined;
  if (filter === 'offers') {
    return sql`exists (
      select 1 from product_variants pv_offer
      where pv_offer.product_id = ${products.id}
        and pv_offer.active = true
        and pv_offer.price_minor is not null
        and pv_offer.compare_at_minor is not null
        and pv_offer.compare_at_minor > pv_offer.price_minor
    )`;
  }
  return eq(products.audience, filter);
}

function localizedCollectionJoin(locale: AppLocale) {
  return and(
    eq(collectionTranslations.collectionId, collections.id),
    eq(collectionTranslations.locale, locale)
  );
}

export async function listActiveProducts(locale: AppLocale, filter: CatalogFilter = 'all') {
  if (!hasDatabaseConfiguration()) return listFallbackProducts(locale, filter);

  return getDatabase()
    .select({
      id: products.id,
      slug: products.slug,
      audience: products.audience,
      family: products.family,
      newArrival: products.newArrival,
      collection: collections.slug,
      collectionName: collectionTranslations.name,
      name: productTranslations.name,
      subtitle: productTranslations.subtitle,
      image: sql<string | null>`(
        select pi.url from product_images pi
        where pi.product_id = ${products.id}
        order by pi.sort_order asc
        limit 1
      )`,
      priceMinor: sql<number | null>`(
        select pv.price_minor from product_variants pv
        where pv.product_id = ${products.id}
          and pv.active = true
          and pv.price_minor is not null
        order by pv.price_minor asc
        limit 1
      )`,
      compareAtMinor: sql<number | null>`(
        select pv.compare_at_minor from product_variants pv
        where pv.product_id = ${products.id}
          and pv.active = true
          and pv.price_minor is not null
        order by pv.price_minor asc
        limit 1
      )`,
      currency: sql<string | null>`(
        select pv.currency from product_variants pv
        where pv.product_id = ${products.id}
          and pv.active = true
          and pv.price_minor is not null
          and pv.currency is not null
        order by pv.price_minor asc
        limit 1
      )`,
      available: sql<number>`(
        select coalesce(sum(greatest(0, i.on_hand - i.reserved)), 0)
        from product_variants pv
        join inventory i on i.variant_id = pv.id
        where pv.product_id = ${products.id} and pv.active = true
      )`
    })
    .from(products)
    .innerJoin(
      productTranslations,
      and(eq(productTranslations.productId, products.id), eq(productTranslations.locale, locale))
    )
    .leftJoin(collections, eq(collections.id, products.collectionId))
    .leftJoin(collectionTranslations, localizedCollectionJoin(locale))
    .where(and(eq(products.status, 'active'), filterCondition(filter)))
    .orderBy(asc(productTranslations.name));
}

export async function listActiveProductSitemapEntries() {
  if (!hasDatabaseConfiguration()) return listFallbackSitemapEntries();

  return getDatabase()
    .select({slug: products.slug, updatedAt: products.updatedAt})
    .from(products)
    .where(eq(products.status, 'active'))
    .orderBy(asc(products.slug));
}

async function readActiveProduct(locale: AppLocale, slug: string) {
  if (!hasDatabaseConfiguration()) return findFallbackProduct(locale, slug);

  const [product] = await getDatabase()
    .select({
      id: products.id,
      slug: products.slug,
      audience: products.audience,
      family: products.family,
      newArrival: products.newArrival,
      collection: collections.slug,
      collectionName: collectionTranslations.name,
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
    .leftJoin(collectionTranslations, localizedCollectionJoin(locale))
    .where(and(eq(products.slug, slug), eq(products.status, 'active')))
    .limit(1);

  if (!product) return null;
  const [images, variants] = await Promise.all([
    listProductImages(product.id),
    listProductVariants(product.id, locale)
  ]);
  return {...product, images, variants, commerceEnabled: true};
}

export const findActiveProduct = cache(readActiveProduct);

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
    .innerJoin(inventory, eq(inventory.variantId, productVariants.id))
    .where(and(eq(productVariants.productId, productId), eq(productVariants.active, true)))
    .orderBy(asc(colors.code), asc(sizes.sortOrder));

  return rows.map((row) => ({...row, available: Math.max(0, row.onHand - row.reserved)}));
}

export type ActiveCatalogProduct = Awaited<ReturnType<typeof findActiveProduct>>;
export type ActiveCatalogListItem = Awaited<ReturnType<typeof listActiveProducts>>[number];
