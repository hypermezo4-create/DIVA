import Image from 'next/image';
import Link from 'next/link';
import type {AppLocale} from '@/i18n/routing';

type ProductCardItem = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  image: string | null;
  newArrival: boolean;
  priceMinor: number | null;
  currency: string | null;
  available: number;
};

function formatPrice(locale: AppLocale, priceMinor: number, currency: string) {
  return new Intl.NumberFormat(locale, {style: 'currency', currency}).format(priceMinor / 100);
}

export function ProductCard({
  locale,
  product,
  newLabel,
  soldOutLabel
}: {
  locale: AppLocale;
  product: ProductCardItem;
  newLabel: string;
  soldOutLabel: string;
}) {
  return (
    <Link href={`/${locale}/product/${product.slug}`} className="product-card">
      <div className="product-card__image">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 800px) 100vw, (max-width: 1180px) 50vw, 33vw"
            className="cover-image"
          />
        ) : <div className="product-card__placeholder" aria-hidden="true" />}
        {product.newArrival && <span className="product-card__badge">{newLabel}</span>}
      </div>
      <div className="product-card__copy">
        <p>{product.subtitle}</p>
        <h2>{product.name}</h2>
        <span className="product-card__price">
          {product.available <= 0
            ? soldOutLabel
            : product.priceMinor !== null && product.currency
              ? formatPrice(locale, product.priceMinor, product.currency)
              : '—'}
        </span>
      </div>
    </Link>
  );
}
