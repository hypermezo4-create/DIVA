import type {AppLocale} from '@/i18n/routing';

export const catalogFilters = ['all', 'women', 'men', 'kids', 'offers'] as const;
export type CatalogFilter = (typeof catalogFilters)[number];
export type CatalogAudience = 'women' | 'men' | 'kids';

export function isCatalogFilter(value: string | undefined): value is CatalogFilter {
  return value !== undefined && catalogFilters.includes(value as CatalogFilter);
}

export type LocalizedProductCopy = {
  name: string;
  subtitle: string;
  description: string;
};

export type ProductColor = {
  hex: string;
  label: Record<AppLocale, string>;
};

export type CatalogProduct = {
  slug: string;
  audience: CatalogAudience;
  family: 'sneaker' | 'heel' | 'loafer' | 'boot' | 'sandal';
  image: string;
  gallery: readonly string[];
  newArrival: boolean;
  collection: 'mirror' | 'city' | null;
  sizes: readonly string[];
  colors: readonly ProductColor[];
  copy: Record<AppLocale, LocalizedProductCopy>;
};
