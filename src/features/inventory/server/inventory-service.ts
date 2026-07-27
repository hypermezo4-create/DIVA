import 'server-only';

import {and, eq, gte, sql} from 'drizzle-orm';
import {getDatabase} from '@/db/client';
import {inventory} from '@/db/schema';

function assertPositiveQuantity(quantity: number) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new RangeError('Inventory quantity must be a positive integer.');
  }
}

export async function reserveStock(variantId: string, quantity: number) {
  assertPositiveQuantity(quantity);

  const [row] = await getDatabase()
    .update(inventory)
    .set({
      reserved: sql`${inventory.reserved} + ${quantity}`,
      updatedAt: new Date()
    })
    .where(
      and(
        eq(inventory.variantId, variantId),
        sql`${inventory.onHand} - ${inventory.reserved} >= ${quantity}`
      )
    )
    .returning({onHand: inventory.onHand, reserved: inventory.reserved});

  return row ?? null;
}

export async function releaseStock(variantId: string, quantity: number) {
  assertPositiveQuantity(quantity);

  const [row] = await getDatabase()
    .update(inventory)
    .set({
      reserved: sql`${inventory.reserved} - ${quantity}`,
      updatedAt: new Date()
    })
    .where(and(eq(inventory.variantId, variantId), gte(inventory.reserved, quantity)))
    .returning({onHand: inventory.onHand, reserved: inventory.reserved});

  return row ?? null;
}
