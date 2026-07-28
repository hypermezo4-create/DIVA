'use client';

import Image from 'next/image';
import Link from 'next/link';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import {useMemo, useState} from 'react';
import type {AppLocale} from '@/i18n/routing';

type HeroCopy = {
  kicker: string;
  title: string;
  description: string;
  primary: string;
  secondary: string;
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

function money(locale: AppLocale, minor: number, currency: string) {
  return new Intl.NumberFormat(locale, {style: 'currency', currency}).format(minor / 100);
}

export function Hero({locale, copy, items}: {locale: AppLocale; copy: HeroCopy; items: HeroItem[]}) {
  const reduceMotion = useReducedMotion();
  const visualItems = useMemo(() => items.filter((item) => item.image).slice(0, 4), [items]);
  const [selectedId, setSelectedId] = useState(visualItems[0]?.id ?? '');
  const selected = visualItems.find((item) => item.id === selectedId) ?? visualItems[0];

  return (
    <section className="hero-shell hero-shell--classic">
      <div className="hero-glow" aria-hidden="true" />

      <motion.div
        className="hero-copy"
        initial={reduceMotion ? undefined : {opacity: 0, y: 10}}
        animate={reduceMotion ? undefined : {opacity: 1, y: 0}}
        transition={{duration: 0.4, ease: [0.22, 1, 0.36, 1]}}
      >
        <div className="hero-brand-seal" aria-hidden="true">
          <Image src="/brand/diva-logo-original-mark.svg" alt="" width={92} height={96} priority />
        </div>
        <p className="eyebrow">{copy.kicker}</p>
        <h1>{copy.title}</h1>
        <p className="hero-description">{copy.description}</p>
        <div className="hero-actions">
          <Link className="button button--primary" href={`/${locale}/shop`}>
            {copy.primary}
          </Link>
        </div>
      </motion.div>

      <motion.div
        className="hero-showcase"
        initial={reduceMotion ? undefined : {opacity: 0, x: 10}}
        animate={reduceMotion ? undefined : {opacity: 1, x: 0}}
        transition={{duration: 0.46, delay: 0.03, ease: [0.22, 1, 0.36, 1]}}
      >
        {selected ? (
          <>
            <div className="hero-showcase__main">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  className="hero-showcase__content"
                  key={selected.id}
                  initial={reduceMotion ? undefined : {opacity: 0, y: 5}}
                  animate={reduceMotion ? undefined : {opacity: 1, y: 0}}
                  exit={reduceMotion ? undefined : {opacity: 0, y: -4}}
                  transition={{duration: 0.22, ease: [0.22, 1, 0.36, 1]}}
                >
                  <Link className="hero-showcase__product-link" href={`/${locale}/product/${selected.slug}`}>
                    <div className="hero-showcase__image">
                      <Image
                        src={selected.image!}
                        alt={selected.name}
                        fill
                        sizes="(max-width: 900px) 94vw, 48vw"
                        className="cover-image"
                        priority
                      />
                    </div>
                    <div className="hero-showcase__meta">
                      <div>
                        <p>DIVA · {copy.edition}</p>
                        <h2>{selected.name}</h2>
                        <span>{selected.subtitle}</span>
                      </div>
                      {selected.priceMinor !== null && selected.currency && (
                        <div className="hero-showcase__price">
                          <strong>{money(locale, selected.priceMinor, selected.currency)}</strong>
                          {selected.compareAtMinor !== null && selected.compareAtMinor > selected.priceMinor && (
                            <del>{money(locale, selected.compareAtMinor, selected.currency)}</del>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="hero-showcase__rail" aria-label={copy.edition}>
              {visualItems.map((item, index) => {
                const active = item.id === selected.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={active ? 'hero-thumb is-active' : 'hero-thumb'}
                    onClick={() => setSelectedId(item.id)}
                    aria-pressed={active}
                    aria-label={item.name}
                  >
                    <Image src={item.image!} alt="" fill sizes="120px" className="cover-image" />
                    <span aria-hidden="true">0{index + 1}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="hero-showcase__empty" aria-hidden="true">DIVA</div>
        )}
      </motion.div>
    </section>
  );
}
