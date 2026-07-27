import 'server-only';

import {and, asc, eq, inArray, sql} from 'drizzle-orm';
import {getDatabase} from '@/db/client';
import {
  cartItems,
  carts,
  colors,
  colorTranslations,
  inventory,
  productTranslations,
  products,
  productVariants,
  sizes,
  wishlists
} from '@/db/schema';
import type {AppLocale} from '@/i18n/routing';
import type {CartLine, StoredCartItem, WishlistEntry} from './types';

export class CustomerCommerceError extends Error {
  constructor(public readonly code: 'NOT_SELLABLE' | 'INSUFFICIENT_STOCK' | 'CART_NOT_FOUND') {
    super(code);
  }
}

async function getOrCreateCart(userId: string) {
  const db = getDatabase();
  const [existing] = await db.select({id: carts.id}).from(carts).where(eq(carts.userId, userId)).limit(1);
  if (existing) return existing.id;

  const [created] = await db
    .insert(carts)
    .values({userId})
    .onConflictDoNothing({target: carts.userId})
    .returning({id: carts.id});

  if (created) return created.id;
  const [raced] = await db.select({id: carts.id}).from(carts).where(eq(carts.userId, userId)).limit(1);
  if (!raced) throw new CustomerCommerceError('CART_NOT_FOUND');
  return raced.id;
}

async function getSellableVariant(variantId: string) {
  const [variant] = await getDatabase()
    .select({
      id: productVariants.id,
      priceMinor: productVariants.priceMinor,
      currency: productVariants.currency,
      available: sql<number>`greatest(0, ${inventory.onHand} - ${inventory.reserved})`
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .innerJoin(inventory, eq(inventory.variantId, productVariants.id))
    .where(and(eq(productVariants.id, variantId), eq(productVariants.active, true), eq(products.status, 'active')))
    .limit(1);

  if (!variant || variant.priceMinor === null || variant.currency === null) {
    throw new CustomerCommerceError('NOT_SELLABLE');
  }
  return variant;
}

export async function addCartItem(userId: string, variantId: string, quantity: number) {
  const variant = await getSellableVariant(variantId);
  const cartId = await getOrCreateCart(userId);
  const [existing] = await getDatabase()
    .select({quantity: cartItems.quantity})
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)))
    .limit(1);
  const desired = (existing?.quantity ?? 0) + quantity;
  if (desired > variant.available) throw new CustomerCommerceError('INSUFFICIENT_STOCK');

  await getDatabase()
    .insert(cartItems)
    .values({cartId, variantId, quantity: desired})
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.variantId],
      set: {quantity: desired, updatedAt: new Date()}
    });
}

export async function setCartItemQuantity(userId: string, variantId: string, quantity: number) {
  const variant = await getSellableVariant(variantId);
  if (quantity > variant.available) throw new CustomerCommerceError('INSUFFICIENT_STOCK');
  const cartId = await getOrCreateCart(userId);
  await getDatabase()
    .update(cartItems)
    .set({quantity, updatedAt: new Date()})
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)));
}

export async function removeCartItem(userId: string, variantId: string) {
  const [cart] = await getDatabase().select({id: carts.id}).from(carts).where(eq(carts.userId, userId)).limit(1);
  if (!cart) return;
  await getDatabase().delete(cartItems).where(and(eq(cartItems.cartId, cart.id), eq(cartItems.variantId, variantId)));
}

function cartLineSelection() {
  return {
    variantId: productVariants.id,
    productId: products.id,
    slug: products.slug,
    name: productTranslations.name,
    image: sql<string | null>`(
      select pi.url from product_images pi
      where pi.product_id = ${products.id}
      order by pi.sort_order asc
      limit 1
    )`,
    size: sizes.label,
    colorLabel: colorTranslations.label,
    colorHex: colors.hex,
    priceMinor: productVariants.priceMinor,
    currency: productVariants.currency,
    available: sql<number>`greatest(0, ${inventory.onHand} - ${inventory.reserved})`
  };
}

async function hydrateCartItems(items: readonly StoredCartItem[], locale: AppLocale): Promise<CartLine[]> {
  if (items.length === 0) return [];
  const ids = [...new Set(items.map((item) => item.variantId))];
  const rows = await getDatabase()
    .select(cartLineSelection())
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .innerJoin(productTranslations, and(eq(productTranslations.productId, products.id), eq(productTranslations.locale, locale)))
    .innerJoin(sizes, eq(sizes.id, productVariants.sizeId))
    .innerJoin(colors, eq(colors.id, productVariants.colorId))
    .innerJoin(colorTranslations, and(eq(colorTranslations.colorId, colors.id), eq(colorTranslations.locale, locale)))
    .innerJoin(inventory, eq(inventory.variantId, productVariants.id))
    .where(and(inArray(productVariants.id, ids), eq(productVariants.active, true), eq(products.status, 'active')))
    .orderBy(asc(productTranslations.name));

  const quantities = new Map(items.map((item) => [item.variantId, item.quantity]));
  return rows.flatMap((row) => {
    if (row.priceMinor === null || row.currency === null) return [];
    return [{
      variantId: row.variantId,
      productId: row.productId,
      slug: row.slug,
      name: row.name,
      image: row.image,
      size: row.size,
      colorLabel: row.colorLabel,
      colorHex: row.colorHex,
      priceMinor: row.priceMinor,
      currency: row.currency,
      available: row.available,
      quantity: quantities.get(row.variantId) ?? 1
    } satisfies CartLine];
  });
}

export async function getCartLines(userId: string, locale: AppLocale) {
  const [cart] = await getDatabase().select({id: carts.id}).from(carts).where(eq(carts.userId, userId)).limit(1);
  if (!cart) return [];
  const items = await getDatabase()
    .select({variantId: cartItems.variantId, quantity: cartItems.quantity})
    .from(cartItems)
    .where(eq(cartItems.cartId, cart.id));
  return hydrateCartItems(items, locale);
}

export async function quoteGuestCart(items: readonly StoredCartItem[], locale: AppLocale) {
  return hydrateCartItems(items, locale);
}

export async function addWishlistItem(userId: string, productId: string) {
  await getDatabase().insert(wishlists).values({userId, productId}).onConflictDoNothing();
}

export async function removeWishlistItem(userId: string, productId: string) {
  await getDatabase().delete(wishlists).where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
}

export async function getWishlistEntries(userId: string, locale: AppLocale): Promise<WishlistEntry[]> {
  return getDatabase()
    .select({
      productId: products.id,
      slug: products.slug,
      name: productTranslations.name,
      subtitle: productTranslations.subtitle,
      image: sql<string | null>`(
        select pi.url from product_images pi
        where pi.product_id = ${products.id}
        order by pi.sort_order asc
        limit 1
      )`
    })
    .from(wishlists)
    .innerJoin(products, eq(products.id, wishlists.productId))
    .innerJoin(productTranslations, and(eq(productTranslations.productId, products.id), eq(productTranslations.locale, locale)))
    .where(and(eq(wishlists.userId, userId), eq(products.status, 'active')))
    .orderBy(asc(productTranslations.name));
}

export async function quoteWishlist(productIds: readonly string[], locale: AppLocale): Promise<WishlistEntry[]> {
  if (productIds.length === 0) return [];
  return getDatabase()
    .select({
      productId: products.id,
      slug: products.slug,
      name: productTranslations.name,
      subtitle: productTranslations.subtitle,
      image: sql<string | null>`(
        select pi.url from product_images pi
        where pi.product_id = ${products.id}
        order by pi.sort_order asc
        limit 1
      )`
    })
    .from(products)
    .innerJoin(productTranslations, and(eq(productTranslations.productId, products.id), eq(productTranslations.locale, locale)))
    .where(and(inArray(products.id, [...new Set(productIds)]), eq(products.status, 'active')))
    .orderBy(asc(productTranslations.name));
}
