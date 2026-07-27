'use client';

import Image from 'next/image';
import Link from 'next/link';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import {useEffect, useMemo, useState} from 'react';
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
  const [paused, setPaused] = useState(false);
  const selected = visualItems.find((item) => item.id === selectedId) ?? visualItems[0];

  useEffect(() => {
    if (reduceMotion || paused || visualItems.length < 2) return;

    const timer = window.setInterval(() => {
      setSelectedId((currentId) => {
        const currentIndex = visualItems.findIndex((item) => item.id === currentId);
        const nextIndex = (currentIndex + 1) % visualItems.length;
        return visualItems[nextIndex]?.id ?? currentId;
      });
    }, 5200);

    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, visualItems]);

  return (
    <section className="hero-shell hero-shell--classic">
      <div className="hero-glow" aria-hidden="true" />

      <motion.div
        className="hero-copy"
        initial={reduceMotion ? undefined : {opacity: 0, y: 22}}
        animate={reduceMotion ? undefined : {opacity: 1, y: 0}}
        transition={{duration: 0.7, ease: [0.22, 1, 0.36, 1]}}
      >
        <p className="eyebrow">{copy.kicker}</p>
        <h1>{copy.title}</h1>
        <p className="hero-description">{copy.description}</p>
        <div className="hero-actions">
          <Link className="button button--primary" href={`/${locale}/shop`}>
            {copy.primary}
          </Link>
          <a className="button button--ghost" href="#signature">
            {copy.secondary}
          </a>
        </div>
        <div className="hero-signature-line" aria-hidden="true">
          <span>DIVA</span>
          <i />
          <span>{copy.edition}</span>
        </div>
      </motion.div>

      <motion.div
        className="hero-showcase"
        initial={reduceMotion ? undefined : {opacity: 0, x: 24}}
        animate={reduceMotion ? undefined : {opacity: 1, x: 0}}
        transition={{duration: 0.82, delay: 0.06, ease: [0.22, 1, 0.36, 1]}}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
      >
        {selected ? (
          <>
            <div className="hero-showcase__main">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  className="hero-showcase__content"
                  key={selected.id}
                  initial={reduceMotion ? undefined : {opacity: 0, y: 14, scale: 0.982}}
                  animate={reduceMotion ? undefined : {opacity: 1, y: 0, scale: 1}}
                  exit={reduceMotion ? undefined : {opacity: 0, y: -10, scale: 0.99}}
                  transition={{duration: 0.48, ease: [0.22, 1, 0.36, 1]}}
                >
                  <div className="hero-showcase__image">
                    <Image
                      src={selected.image!}
                      alt={selected.name}
                      fill
                      sizes="(max-width: 900px) 92vw, 44vw"
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
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="hero-showcase__rail" aria-label={copy.edition}>
              {visualItems.map((item, index) => {
                const active = item.id === selected.id;
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    className={active ? 'hero-thumb is-active' : 'hero-thumb'}
                    onClick={() => setSelectedId(item.id)}
                    onFocus={() => setPaused(true)}
                    onBlur={() => setPaused(false)}
                    aria-pressed={active}
                    aria-label={item.name}
                    initial={reduceMotion ? undefined : {opacity: 0, y: 10}}
                    animate={reduceMotion ? undefined : {opacity: active ? 1 : 0.78, y: 0}}
                    whileHover={reduceMotion ? undefined : {scale: 1.025}}
                    transition={{duration: 0.32, delay: reduceMotion ? 0 : 0.12 + index * 0.06}}
                  >
                    <Image src={item.image!} alt="" fill sizes="150px" className="cover-image" />
                  </motion.button>
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
