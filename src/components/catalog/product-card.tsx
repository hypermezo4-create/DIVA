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
  compareAtMinor: number | null;
  currency: string | null;
  available: number;
};

type ProductCardHeading = 'h2' | 'h3';

function formatPrice(locale: AppLocale, priceMinor: number, currency: string) {
  return new Intl.NumberFormat(locale, {style: 'currency', currency}).format(priceMinor / 100);
}

export function ProductCard({
  locale,
  product,
  newLabel,
  offerLabel,
  soldOutLabel,
  headingLevel = 'h2'
}: {
  locale: AppLocale;
  product: ProductCardItem;
  newLabel: string;
  offerLabel: string;
  soldOutLabel: string;
  headingLevel?: ProductCardHeading;
}) {
  const Heading = headingLevel;
  const onOffer = product.priceMinor !== null
    && product.compareAtMinor !== null
    && product.compareAtMinor > product.priceMinor;

  return (
    <Link href={`/${locale}/product/${product.slug}`} className="product-card">
      <div className="product-card__image">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 620px) 50vw, (max-width: 1200px) 50vw, 25vw"
            className="cover-image"
          />
        ) : <div className="product-card__placeholder" aria-hidden="true" />}
        {onOffer
          ? <span className="product-card__badge">{offerLabel}</span>
          : product.newArrival && <span className="product-card__badge">{newLabel}</span>}
      </div>
      <div className="product-card__copy">
        <p>{product.subtitle}</p>
        <Heading>{product.name}</Heading>
        <span className="product-card__price">
          {product.available <= 0
            ? soldOutLabel
            : product.priceMinor !== null && product.currency
              ? (
                <span className="product-card__price-stack">
                  <strong>{formatPrice(locale, product.priceMinor, product.currency)}</strong>
                  {onOffer && <del>{formatPrice(locale, product.compareAtMinor!, product.currency)}</del>}
                </span>
              )
              : '—'}
        </span>
      </div>
    </Link>
  );
}
