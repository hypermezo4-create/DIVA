import Image from 'next/image';
import Link from 'next/link';
import type {AppLocale} from '@/i18n/routing';

type SignatureItem = {
  slug: string;
  title: string;
  label: string;
  image: string | null;
};

export function SignatureGrid({
  locale,
  title,
  items
}: {
  locale: AppLocale;
  title: string;
  items: SignatureItem[];
}) {
  return (
    <section className="signature-section" id="signature">
      <div className="section-heading section-heading--editorial">
        <p className="eyebrow" translate="no">DIVA EDITIONS</p>
        <h2>{title}</h2>
      </div>

      <div className={`signature-grid ${items.length === 4 ? 'signature-grid--four' : ''}`}>
        {items.map((item, index) => (
          <Link
            className={`signature-card signature-card--${index + 1}`}
            href={`/${locale}/shop?category=${item.slug}`}
            key={item.slug}
          >
            <div className="signature-card__image">
              {item.image ? (
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 620px) 50vw, (max-width: 1200px) 50vw, 58vw"
                  className="cover-image"
                />
              ) : <div className="signature-card__placeholder" aria-hidden="true" />}
            </div>
            <div className="signature-card__copy">
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <span className="signature-card__arrow" aria-hidden="true">↗</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
