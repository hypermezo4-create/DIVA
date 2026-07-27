'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import type {CartLine, StoredCartItem, WishlistEntry} from '@/features/customer-commerce/types';
import type {AppLocale} from '@/i18n/routing';
import {authClient} from '@/lib/auth-client';

const CART_KEY = 'diva:guest-cart:v1';
const WISHLIST_KEY = 'diva:guest-wishlist:v1';

type CommerceContextValue = {
  cart: CartLine[];
  wishlist: WishlistEntry[];
  cartCount: number;
  wishlistCount: number;
  ready: boolean;
  signedIn: boolean;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  setCartQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (variantId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  refresh: () => Promise<void>;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);

function readGuestCart(): StoredCartItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(CART_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const variantId: unknown = Reflect.get(item, 'variantId');
      const quantity: unknown = Reflect.get(item, 'quantity');
      return typeof variantId === 'string' && typeof quantity === 'number' && Number.isInteger(quantity) && quantity > 0 && quantity <= 20
        ? [{variantId, quantity}]
        : [];
    });
  } catch {
    return [];
  }
}

function readGuestWishlist(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: StoredCartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function writeGuestWishlist(productIds: string[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(productIds));
}

async function jsonRequest<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has('content-type')) headers.set('content-type', 'application/json');
  const response = await fetch(url, {...init, headers});
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as {error?: string} | null;
    throw new Error(payload?.error ?? `HTTP_${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function CommerceProvider({children, locale}: {children: ReactNode; locale: AppLocale}) {
  const {data: session, isPending: sessionPending} = authClient.useSession();
  const userId = session?.user.id ?? null;
  const [guestCart, setGuestCart] = useState<StoredCartItem[]>([]);
  const [guestWishlist, setGuestWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<WishlistEntry[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const syncedUser = useRef<string | null>(null);

  useEffect(() => {
    setGuestCart(readGuestCart());
    setGuestWishlist(readGuestWishlist());
    setStorageReady(true);
  }, []);

  const refresh = useCallback(async () => {
    try {
      if (userId) {
        const [cartPayload, wishlistPayload] = await Promise.all([
          jsonRequest<{items: CartLine[]}>(`/api/cart?locale=${locale}`),
          jsonRequest<{items: WishlistEntry[]}>(`/api/wishlist?locale=${locale}`)
        ]);
        setCart(cartPayload.items);
        setWishlist(wishlistPayload.items);
        return;
      }

      if (!storageReady) return;
      const [cartPayload, wishlistPayload] = await Promise.all([
        jsonRequest<{items: CartLine[]}>('/api/cart/quote', {
          method: 'POST',
          body: JSON.stringify({locale, items: guestCart})
        }),
        jsonRequest<{items: WishlistEntry[]}>('/api/wishlist/quote', {
          method: 'POST',
          body: JSON.stringify({locale, productIds: guestWishlist})
        })
      ]);
      setCart(cartPayload.items);
      setWishlist(wishlistPayload.items);
    } finally {
      setHydrated(true);
    }
  }, [guestCart, guestWishlist, locale, storageReady, userId]);

  useEffect(() => {
    if (sessionPending || !storageReady) return;

    async function syncAndRefresh() {
      if (userId && syncedUser.current !== userId) {
        const cartResults = await Promise.allSettled(
          guestCart.map((item) => jsonRequest('/api/cart', {method: 'POST', body: JSON.stringify(item)}))
        );
        const keptCart = guestCart.filter((_, index) => cartResults[index]?.status === 'rejected');
        setGuestCart(keptCart);
        writeGuestCart(keptCart);

        const wishlistResults = await Promise.allSettled(
          guestWishlist.map((productId) => jsonRequest('/api/wishlist', {
            method: 'POST',
            body: JSON.stringify({productId})
          }))
        );
        const keptWishlist = guestWishlist.filter((_, index) => wishlistResults[index]?.status === 'rejected');
        setGuestWishlist(keptWishlist);
        writeGuestWishlist(keptWishlist);
        syncedUser.current = userId;
      }

      if (!userId) syncedUser.current = null;
      await refresh();
    }

    void syncAndRefresh().catch(() => setHydrated(true));
  }, [guestCart, guestWishlist, refresh, sessionPending, storageReady, userId]);

  const addToCart = useCallback(async (variantId: string, quantity = 1) => {
    if (userId) {
      await jsonRequest('/api/cart', {method: 'POST', body: JSON.stringify({variantId, quantity})});
      await refresh();
      return;
    }

    setGuestCart((current) => {
      const existing = current.find((item) => item.variantId === variantId);
      const next = existing
        ? current.map((item) => item.variantId === variantId
          ? {...item, quantity: Math.min(20, item.quantity + quantity)}
          : item)
        : [...current, {variantId, quantity}];
      writeGuestCart(next);
      return next;
    });
  }, [refresh, userId]);

  const setCartQuantity = useCallback(async (variantId: string, quantity: number) => {
    if (userId) {
      await jsonRequest('/api/cart', {method: 'PATCH', body: JSON.stringify({variantId, quantity})});
      await refresh();
      return;
    }
    setGuestCart((current) => {
      const next = current.map((item) => item.variantId === variantId ? {...item, quantity} : item);
      writeGuestCart(next);
      return next;
    });
  }, [refresh, userId]);

  const removeFromCart = useCallback(async (variantId: string) => {
    if (userId) {
      await jsonRequest('/api/cart', {method: 'DELETE', body: JSON.stringify({variantId})});
      await refresh();
      return;
    }
    setGuestCart((current) => {
      const next = current.filter((item) => item.variantId !== variantId);
      writeGuestCart(next);
      return next;
    });
  }, [refresh, userId]);

  const clearCart = useCallback(async () => {
    if (userId) {
      await refresh();
      return;
    }
    setGuestCart([]);
    setCart([]);
    writeGuestCart([]);
  }, [refresh, userId]);

  const toggleWishlist = useCallback(async (productId: string) => {
    const active = wishlist.some((item) => item.productId === productId);
    if (userId) {
      await jsonRequest('/api/wishlist', {
        method: active ? 'DELETE' : 'POST',
        body: JSON.stringify({productId})
      });
      await refresh();
      return;
    }
    setGuestWishlist((current) => {
      const next = current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId];
      writeGuestWishlist(next);
      return next;
    });
  }, [refresh, userId, wishlist]);

  const value = useMemo<CommerceContextValue>(() => ({
    cart,
    wishlist,
    cartCount: cart.reduce((count, item) => count + item.quantity, 0),
    wishlistCount: wishlist.length,
    ready: storageReady && !sessionPending && hydrated,
    signedIn: Boolean(userId),
    addToCart,
    setCartQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist,
    isWishlisted: (productId: string) => wishlist.some((item) => item.productId === productId),
    refresh
  }), [
    addToCart,
    cart,
    clearCart,
    hydrated,
    refresh,
    removeFromCart,
    sessionPending,
    setCartQuantity,
    storageReady,
    toggleWishlist,
    userId,
    wishlist
  ]);

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const value = useContext(CommerceContext);
  if (!value) throw new Error('useCommerce must be used inside CommerceProvider');
  return value;
}
