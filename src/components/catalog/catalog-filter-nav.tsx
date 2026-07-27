import Link from 'next/link';
import {catalogFilters, type CatalogFilter} from '@/features/catalog/types';
import type {AppLocale} from '@/i18n/routing';

export function CatalogFilterNav({
  locale,
  active,
  labels
}: {
  locale: AppLocale;
  active: CatalogFilter;
  labels: Record<CatalogFilter, string>;
}) {
  return (
    <nav className="catalog-filters" aria-label={labels.all}>
      {catalogFilters.map((filter) => {
        const href = filter === 'all' ? `/${locale}/shop` : `/${locale}/shop?category=${filter}`;

        return (
          <Link
            key={filter}
            href={href}
            className={filter === active ? 'catalog-filter is-active' : 'catalog-filter'}
            aria-current={filter === active ? 'page' : undefined}
          >
            {labels[filter]}
          </Link>
        );
      })}
    </nav>
  );
}
