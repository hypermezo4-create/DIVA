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
        <p className="eyebrow">DIVA EDITIONS</p>
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
                  sizes="(max-width: 800px) 100vw, (max-width: 1180px) 50vw, 25vw"
                  className="cover-image"
                />
              ) : <div className="signature-card__placeholder" aria-hidden="true" />}
              <span className="signature-card__index" aria-hidden="true">0{index + 1}</span>
            </div>
            <div className="signature-card__copy">
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <span aria-hidden="true">↗</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
