import 'server-only';

import {and, eq, inArray, sql} from 'drizzle-orm';
import {getDatabase} from '@/db/client';
import {
  cartItems,
  carts,
  colors,
  colorTranslations,
  inventory,
  orderItems,
  orders,
  productTranslations,
  products,
  productVariants,
  sizes
} from '@/db/schema';
import type {AppLocale} from '@/i18n/routing';

export type CheckoutItem = {variantId: string; quantity: number};
export type CheckoutAddress = {
  customerName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  countryCode: string;
};

export class CheckoutError extends Error {
  constructor(public readonly code: 'EMPTY_CART' | 'INVALID_ITEM' | 'INSUFFICIENT_STOCK' | 'MIXED_CURRENCY') {
    super(code);
  }
}

function createOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = crypto.randomUUID().slice(0, 6).toUpperCase();
  return `DIVA-${stamp}-${suffix}`;
}

export async function createCheckoutOrder({
  userId,
  locale,
  items,
  address,
  shippingMethod
}: {
  userId: string | null;
  locale: AppLocale;
  items: CheckoutItem[];
  address: CheckoutAddress;
  shippingMethod: 'standard';
}) {
  if (items.length === 0) throw new CheckoutError('EMPTY_CART');

  const quantityByVariant = new Map<string, number>();
  for (const item of items) {
    quantityByVariant.set(item.variantId, (quantityByVariant.get(item.variantId) ?? 0) + item.quantity);
  }
  const variantIds = [...quantityByVariant.keys()];
  const db = getDatabase();

  return db.transaction(async (tx) => {
    const rows = await tx
      .select({
        variantId: productVariants.id,
        sku: productVariants.sku,
        priceMinor: productVariants.priceMinor,
        currency: productVariants.currency,
        productName: productTranslations.name,
        sizeLabel: sizes.label,
        colorLabel: colorTranslations.label
      })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .innerJoin(
        productTranslations,
        and(eq(productTranslations.productId, products.id), eq(productTranslations.locale, locale))
      )
      .innerJoin(sizes, eq(sizes.id, productVariants.sizeId))
      .innerJoin(colors, eq(colors.id, productVariants.colorId))
      .innerJoin(
        colorTranslations,
        and(eq(colorTranslations.colorId, colors.id), eq(colorTranslations.locale, locale))
      )
      .where(and(
        inArray(productVariants.id, variantIds),
        eq(productVariants.active, true),
        eq(products.status, 'active')
      ));

    if (rows.length !== variantIds.length) throw new CheckoutError('INVALID_ITEM');
    if (rows.some((row) => row.priceMinor === null || row.currency === null)) throw new CheckoutError('INVALID_ITEM');

    const currencies = new Set(rows.map((row) => row.currency));
    if (currencies.size !== 1) throw new CheckoutError('MIXED_CURRENCY');
    const currency = rows[0]!.currency!;

    let subtotalMinor = 0;
    const snapshots = [];

    for (const row of rows) {
      const quantity = quantityByVariant.get(row.variantId) ?? 0;
      if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 20) throw new CheckoutError('INVALID_ITEM');

      const [reserved] = await tx
        .update(inventory)
        .set({reserved: sql`${inventory.reserved} + ${quantity}`, updatedAt: new Date()})
        .where(and(
          eq(inventory.variantId, row.variantId),
          sql`${inventory.onHand} - ${inventory.reserved} >= ${quantity}`
        ))
        .returning({variantId: inventory.variantId});

      if (!reserved) throw new CheckoutError('INSUFFICIENT_STOCK');
      const unitPriceMinor = row.priceMinor!;
      const lineTotalMinor = unitPriceMinor * quantity;
      subtotalMinor += lineTotalMinor;
      snapshots.push({...row, quantity, unitPriceMinor, lineTotalMinor});
    }

    const shippingMinor = 0;
    const totalMinor = subtotalMinor + shippingMinor;
    const [order] = await tx
      .insert(orders)
      .values({
        number: createOrderNumber(),
        userId,
        customerName: address.customerName,
        email: address.email,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || null,
        city: address.city,
        region: address.region || null,
        postalCode: address.postalCode || null,
        countryCode: address.countryCode.toUpperCase(),
        shippingMethod,
        currency,
        subtotalMinor,
        shippingMinor,
        totalMinor
      })
      .returning({id: orders.id, number: orders.number});

    await tx.insert(orderItems).values(snapshots.map((item) => ({
      orderId: order!.id,
      variantId: item.variantId,
      sku: item.sku,
      productName: item.productName,
      sizeLabel: item.sizeLabel,
      colorLabel: item.colorLabel,
      unitPriceMinor: item.unitPriceMinor,
      quantity: item.quantity,
      lineTotalMinor: item.lineTotalMinor
    })));

    if (userId) {
      const [cart] = await tx.select({id: carts.id}).from(carts).where(eq(carts.userId, userId)).limit(1);
      if (cart) await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    }

    return {orderId: order!.id, orderNumber: order!.number, currency, subtotalMinor, shippingMinor, totalMinor};
  });
}
