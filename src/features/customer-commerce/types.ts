export type StoredCartItem = {
  variantId: string;
  quantity: number;
};

export type CartLine = StoredCartItem & {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  size: string;
  colorLabel: string;
  colorHex: string;
  priceMinor: number;
  currency: string;
  available: number;
};

export type WishlistEntry = {
  productId: string;
  slug: string;
  name: string;
  subtitle: string;
  image: string | null;
};
