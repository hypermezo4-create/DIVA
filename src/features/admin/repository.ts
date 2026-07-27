import 'server-only';

import {and, asc, desc, eq, sql} from 'drizzle-orm';
import {getDatabase} from '@/db/client';
import {
  colorTranslations,
  inventory,
  orders,
  productTranslations,
  products,
  productVariants,
  sizes,
  user
} from '@/db/schema';
import type {AppLocale} from '@/i18n/routing';

export async function getAdminDashboard() {
  const db = getDatabase();
  const [productsCount, customersCount, pendingOrders, paidOrders, inventorySummary, offerVariants, paidRevenueByCurrency] = await Promise.all([
    db.select({value: sql<number>`count(*)::int`}).from(products).where(eq(products.status, 'active')),
    db.select({value: sql<number>`count(*)::int`}).from(user).where(eq(user.role, 'customer')),
    db.select({value: sql<number>`count(*)::int`}).from(orders).where(eq(orders.status, 'pending_payment')),
    db.select({count: sql<number>`count(*)::int`}).from(orders).where(eq(orders.paymentStatus, 'paid')),
    db.select({units: sql<number>`coalesce(sum(${inventory.onHand} - ${inventory.reserved}), 0)::bigint`}).from(inventory),
    db.select({value: sql<number>`count(*)::int`})
      .from(productVariants)
      .where(and(
        eq(productVariants.active, true),
        sql`${productVariants.priceMinor} is not null`,
        sql`${productVariants.compareAtMinor} is not null`,
        sql`${productVariants.compareAtMinor} > ${productVariants.priceMinor}`
      )),
    db.select({
      currency: orders.currency,
      revenueMinor: sql<number>`coalesce(sum(${orders.totalMinor}), 0)::bigint`
    })
      .from(orders)
      .where(eq(orders.paymentStatus, 'paid'))
      .groupBy(orders.currency)
      .orderBy(asc(orders.currency))
  ]);

  const recentOrders = await db
    .select({
      id: orders.id,
      number: orders.number,
      customerName: orders.customerName,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      currency: orders.currency,
      totalMinor: orders.totalMinor,
      createdAt: orders.createdAt
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(8);

  return {
    activeProducts: productsCount[0]?.value ?? 0,
    customers: customersCount[0]?.value ?? 0,
    pendingOrders: pendingOrders[0]?.value ?? 0,
    paidOrders: paidOrders[0]?.count ?? 0,
    availableUnits: Number(inventorySummary[0]?.units ?? 0),
    offerVariants: offerVariants[0]?.value ?? 0,
    paidRevenueByCurrency: paidRevenueByCurrency.map((row) => ({
      currency: row.currency,
      revenueMinor: Number(row.revenueMinor)
    })),
    recentOrders
  };
}

export async function listAdminProducts(locale: AppLocale) {
  return getDatabase()
    .select({
      id: products.id,
      slug: products.slug,
      audience: products.audience,
      family: products.family,
      status: products.status,
      newArrival: products.newArrival,
      name: productTranslations.name,
      lowestPriceMinor: sql<number | null>`min(${productVariants.priceMinor})`,
      currency: sql<string | null>`case when count(distinct ${productVariants.currency}) = 1 then min(${productVariants.currency}) else null end`,
      availableUnits: sql<number>`coalesce(sum(${inventory.onHand} - ${inventory.reserved}), 0)::bigint`,
      offerVariants: sql<number>`coalesce(sum(case when ${productVariants.compareAtMinor} > ${productVariants.priceMinor} then 1 else 0 end), 0)::int`
    })
    .from(products)
    .innerJoin(
      productTranslations,
      and(eq(productTranslations.productId, products.id), eq(productTranslations.locale, locale))
    )
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
    .groupBy(
      products.id,
      products.slug,
      products.audience,
      products.family,
      products.status,
      products.newArrival,
      productTranslations.name
    )
    .orderBy(asc(productTranslations.name));
}

export async function listAdminInventory(locale: AppLocale) {
  return getDatabase()
    .select({
      variantId: productVariants.id,
      sku: productVariants.sku,
      productName: productTranslations.name,
      size: sizes.label,
      color: colorTranslations.label,
      priceMinor: productVariants.priceMinor,
      compareAtMinor: productVariants.compareAtMinor,
      currency: productVariants.currency,
      active: productVariants.active,
      onHand: inventory.onHand,
      reserved: inventory.reserved,
      available: sql<number>`${inventory.onHand} - ${inventory.reserved}`
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .innerJoin(
      productTranslations,
      and(eq(productTranslations.productId, products.id), eq(productTranslations.locale, locale))
    )
    .innerJoin(sizes, eq(sizes.id, productVariants.sizeId))
    .innerJoin(inventory, eq(inventory.variantId, productVariants.id))
    .innerJoin(
      colorTranslations,
      and(eq(colorTranslations.colorId, productVariants.colorId), eq(colorTranslations.locale, locale))
    )
    .orderBy(asc(productTranslations.name), asc(sizes.sortOrder), asc(productVariants.sku));
}

export async function listAdminOrders() {
  return getDatabase()
    .select({
      id: orders.id,
      number: orders.number,
      customerName: orders.customerName,
      email: orders.email,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      shippingMethod: orders.shippingMethod,
      currency: orders.currency,
      totalMinor: orders.totalMinor,
      createdAt: orders.createdAt
    })
    .from(orders)
    .orderBy(desc(orders.createdAt));
}

export async function listAdminCustomers() {
  return getDatabase()
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      ordersCount: sql<number>`count(${orders.id})::int`
    })
    .from(user)
    .leftJoin(orders, eq(orders.userId, user.id))
    .groupBy(user.id, user.name, user.email, user.role, user.createdAt)
    .orderBy(desc(user.createdAt));
}
