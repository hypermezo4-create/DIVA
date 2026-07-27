import Image from 'next/image';
import Link from 'next/link';
import type {AppLocale} from '@/i18n/routing';

type SignatureItem = {
  slug: string;
  title: string;
  label: string;
};

const imagery = [
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=86',
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=86',
  'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=1200&q=86'
] as const;

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
      <div className="section-heading">
        <p className="eyebrow">DIVA EDITIONS</p>
        <h2>{title}</h2>
      </div>

      <div className="signature-grid">
        {items.map((item, index) => (
          <Link className="signature-card" href={`/${locale}/shop?category=${item.slug}`} key={item.slug}>
            <div className="signature-card__image">
              <Image
                src={imagery[index]}
                alt=""
                fill
                sizes="(max-width: 800px) 100vw, 33vw"
                className="cover-image"
              />
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
