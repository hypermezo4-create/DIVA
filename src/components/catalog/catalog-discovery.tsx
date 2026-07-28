'use client';

import Link from 'next/link';
import {useEffect, useId, useState} from 'react';
import {useRouter} from 'next/navigation';
import {
  catalogFilters,
  catalogSorts,
  type CatalogFilter,
  type CatalogSort
} from '@/features/catalog/types';
import type {AppLocale} from '@/i18n/routing';

const interfaceCopy: Record<AppLocale, {
  browse: string;
  close: string;
  filter: string;
  sort: string;
  categories: string;
  sorts: Record<CatalogSort, string>;
}> = {
  en: {
    browse: 'Browse & sort',
    close: 'Close',
    filter: 'Category',
    sort: 'Sort by',
    categories: 'Shop categories',
    sorts: {
      featured: 'Featured',
      newest: 'Newest first',
      'price-asc': 'Price · Low to high',
      'price-desc': 'Price · High to low'
    }
  },
  ar: {
    browse: 'استكشف ورتّب',
    close: 'إغلاق',
    filter: 'الفئة',
    sort: 'الترتيب',
    categories: 'فئات المتجر',
    sorts: {
      featured: 'مختارات ديفا',
      newest: 'الأحدث أولًا',
      'price-asc': 'السعر · من الأقل للأعلى',
      'price-desc': 'السعر · من الأعلى للأقل'
    }
  },
  de: {
    browse: 'Entdecken & sortieren',
    close: 'Schließen',
    filter: 'Kategorie',
    sort: 'Sortieren nach',
    categories: 'Shop-Kategorien',
    sorts: {
      featured: 'Empfohlen',
      newest: 'Neuheiten zuerst',
      'price-asc': 'Preis · Aufsteigend',
      'price-desc': 'Preis · Absteigend'
    }
  },
  ru: {
    browse: 'Каталог и сортировка',
    close: 'Закрыть',
    filter: 'Категория',
    sort: 'Сортировка',
    categories: 'Категории магазина',
    sorts: {
      featured: 'Рекомендуем',
      newest: 'Сначала новинки',
      'price-asc': 'Цена · По возрастанию',
      'price-desc': 'Цена · По убыванию'
    }
  }
};

function filterHref(locale: AppLocale, filter: CatalogFilter, sort: CatalogSort) {
  const params = new URLSearchParams();
  if (filter !== 'all') params.set('category', filter);
  if (sort !== 'featured') params.set('sort', sort);
  const query = params.toString();
  return `/${locale}/shop${query ? `?${query}` : ''}`;
}

export function CatalogDiscovery({
  locale,
  activeFilter,
  activeSort,
  labels,
  counts,
  resultCount
}: {
  locale: AppLocale;
  activeFilter: CatalogFilter;
  activeSort: CatalogSort;
  labels: Record<CatalogFilter, string>;
  counts: Record<CatalogFilter, number>;
  resultCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const sheetId = useId();
  const copy = interfaceCopy[locale];

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function changeSort(sort: CatalogSort) {
    const params = new URLSearchParams();
    if (activeFilter !== 'all') params.set('category', activeFilter);
    if (sort !== 'featured') params.set('sort', sort);
    const query = params.toString();
    router.replace(`/${locale}/shop${query ? `?${query}` : ''}`, {scroll: false});
    setOpen(false);
  }

  return (
    <div className="catalog-discovery">
      <div className="catalog-discovery__desktop">
        <nav className="catalog-filters" aria-label={copy.categories}>
          {catalogFilters.map((filter) => (
            <Link
              key={filter}
              href={filterHref(locale, filter, activeSort)}
              className={filter === activeFilter ? 'catalog-filter is-active' : 'catalog-filter'}
              aria-current={filter === activeFilter ? 'page' : undefined}
            >
              <span>{labels[filter]}</span>
              <small>{counts[filter]}</small>
            </Link>
          ))}
        </nav>

        <label className="catalog-sort">
          <span>{copy.sort}</span>
          <select
            value={activeSort}
            onChange={(event) => changeSort(event.target.value as CatalogSort)}
            aria-label={copy.sort}
          >
            {catalogSorts.map((sort) => (
              <option key={sort} value={sort}>{copy.sorts[sort]}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="catalog-discovery__mobile">
        <div>
          <strong>{labels[activeFilter]}</strong>
          <span>{resultCount}</span>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={sheetId}
          onClick={() => setOpen(true)}
        >
          {copy.browse}
          <span aria-hidden="true">↗</span>
        </button>
      </div>

      {open && (
        <div className="catalog-sheet" role="presentation" onMouseDown={() => setOpen(false)}>
          <section
            id={sheetId}
            className="catalog-sheet__panel"
            role="dialog"
            aria-modal="true"
            aria-label={copy.browse}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="catalog-sheet__header">
              <div>
                <span>{copy.filter}</span>
                <strong>{copy.browse}</strong>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label={copy.close}>×</button>
            </header>

            <div className="catalog-sheet__section">
              <p>{copy.categories}</p>
              <nav>
                {catalogFilters.map((filter) => (
                  <Link
                    key={filter}
                    href={filterHref(locale, filter, activeSort)}
                    className={filter === activeFilter ? 'is-active' : undefined}
                    aria-current={filter === activeFilter ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    <span>{labels[filter]}</span>
                    <small>{counts[filter]}</small>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="catalog-sheet__section">
              <p>{copy.sort}</p>
              <div className="catalog-sheet__sorts">
                {catalogSorts.map((sort) => (
                  <button
                    key={sort}
                    type="button"
                    className={sort === activeSort ? 'is-active' : undefined}
                    aria-pressed={sort === activeSort}
                    onClick={() => changeSort(sort)}
                  >
                    {copy.sorts[sort]}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}