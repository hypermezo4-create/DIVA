import Image from 'next/image';
import Link from 'next/link';
import type {AppLocale} from '@/i18n/routing';

type OfferProduct = {
  slug: string;
  name: string;
  subtitle: string;
  image: string | null;
  priceMinor: number | null;
  compareAtMinor: number | null;
  currency: string | null;
};

function formatMoney(locale: AppLocale, minor: number, currency: string) {
  return new Intl.NumberFormat(locale, {style: 'currency', currency}).format(minor / 100);
}

export function OfferSpotlight({
  locale,
  product,
  eyebrow,
  action
}: {
  locale: AppLocale;
  product: OfferProduct;
  eyebrow: string;
  action: string;
}) {
  const hasOffer = product.priceMinor !== null
    && product.compareAtMinor !== null
    && product.currency !== null
    && product.compareAtMinor > product.priceMinor;
  const discount = hasOffer
    ? Math.round((1 - product.priceMinor / product.compareAtMinor) * 100)
    : null;

  return (
    <section className="offer-spotlight" aria-labelledby="offer-spotlight-title">
      <div className="offer-spotlight__visual">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 900px) 100vw, 55vw"
            className="cover-image"
          />
        ) : <div className="offer-spotlight__placeholder" aria-hidden="true" />}
        {discount !== null && <span className="offer-spotlight__discount">−{discount}%</span>}
      </div>

      <div className="offer-spotlight__copy">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="offer-spotlight-title">{product.name}</h2>
        <p className="offer-spotlight__subtitle">{product.subtitle}</p>

        {hasOffer && (
          <div className="offer-spotlight__price">
            <strong>{formatMoney(locale, product.priceMinor, product.currency)}</strong>
            <del>{formatMoney(locale, product.compareAtMinor, product.currency)}</del>
          </div>
        )}

        <Link href={`/${locale}/product/${product.slug}`} className="button button--inverse">
          {action}
        </Link>
      </div>
    </section>
  );
}
