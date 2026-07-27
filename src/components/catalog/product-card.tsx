import Image from 'next/image';
import Link from 'next/link';
import {localizeProduct} from '@/features/catalog/catalog';
import type {CatalogProduct} from '@/features/catalog/types';
import type {AppLocale} from '@/i18n/routing';

export function ProductCard({
  locale,
  product,
  newLabel
}: {
  locale: AppLocale;
  product: CatalogProduct;
  newLabel: string;
}) {
  const copy = localizeProduct(product, locale);

  return (
    <Link href={`/${locale}/product/${product.slug}`} className="product-card">
      <div className="product-card__image">
        <Image
          src={product.image}
          alt={copy.name}
          fill
          sizes="(max-width: 800px) 100vw, (max-width: 1180px) 50vw, 33vw"
          className="cover-image"
        />
        {product.newArrival && <span className="product-card__badge">{newLabel}</span>}
      </div>
      <div className="product-card__copy">
        <p>{copy.subtitle}</p>
        <h2>{copy.name}</h2>
        <span aria-hidden="true">↗</span>
      </div>
    </Link>
  );
}
