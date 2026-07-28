'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useState} from 'react';
import type {AppLocale} from '@/i18n/routing';

type HeroCopy = {
  kicker: string;
  title: string;
  description: string;
  primary: string;
  edition: string;
};

type HeroItem = {
  id: string;
  slug: string;
  image: string | null;
  name: string;
  subtitle: string;
  priceMinor: number | null;
  compareAtMinor: number | null;
  currency: string | null;
};

function formatMoney(locale: AppLocale, minor: number, currency: string) {
  return new Intl.NumberFormat(locale, {style: 'currency', currency}).format(minor / 100);
}

export function Hero({locale, copy, items}: {locale: AppLocale; copy: HeroCopy; items: HeroItem[]}) {
  const visualItems = items.filter((item) => item.image).slice(0, 4);
  const [selectedId, setSelectedId] = useState(visualItems[0]?.id ?? '');
  const selected = visualItems.find((item) => item.id === selectedId) ?? visualItems[0];

  return (
    <section className="hero-shell hero-shell--classic" aria-labelledby="home-hero-title">
      <div className="hero-glow" aria-hidden="true" />

      <div className="hero-copy">
        <p className="eyebrow">{copy.kicker}</p>
        <h1 id="home-hero-title">{copy.title}</h1>
        <p className="hero-description">{copy.description}</p>
        <div className="hero-actions">
          <Link className="button button--primary" href={`/${locale}/shop`}>
            {copy.primary}
          </Link>
        </div>
      </div>

      <div className="hero-showcase">
        {selected ? (
          <>
            <div className="hero-showcase__main" id="hero-showcase-content" aria-live="polite">
              <div className="hero-showcase__content" key={selected.id}>
                <Link className="hero-showcase__product-link" href={`/${locale}/product/${selected.slug}`}>
                  <div className="hero-showcase__image">
                    <Image
                      src={selected.image!}
                      alt={selected.name}
                      fill
                      sizes="(max-width: 900px) 94vw, 54vw"
                      className="cover-image"
                      priority
                    />
                  </div>
                  <div className="hero-showcase__meta">
                    <div className="hero-showcase__identity">
                      <p>DIVA · {copy.edition}</p>
                      <h2>{selected.name}</h2>
                      <span>{selected.subtitle}</span>
                    </div>
                    {selected.priceMinor !== null && selected.currency && (
                      <div className="hero-showcase__price">
                        <strong>{formatMoney(locale, selected.priceMinor, selected.currency)}</strong>
                        {selected.compareAtMinor !== null && selected.compareAtMinor > selected.priceMinor && (
                          <del>{formatMoney(locale, selected.compareAtMinor, selected.currency)}</del>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            </div>

            {visualItems.length > 1 && (
              <div className="hero-showcase__rail" aria-label={copy.edition}>
                {visualItems.map((item) => {
                  const active = item.id === selected.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={active ? 'hero-thumb is-active' : 'hero-thumb'}
                      onClick={() => setSelectedId(item.id)}
                      aria-controls="hero-showcase-content"
                      aria-pressed={active}
                      aria-label={item.name}
                    >
                      <Image src={item.image!} alt="" fill sizes="112px" className="cover-image" />
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="hero-showcase__empty" aria-hidden="true">DIVA</div>
        )}
      </div>
    </section>
  );
}
