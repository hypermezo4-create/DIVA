'use client';

import Image from 'next/image';
import Link from 'next/link';
import {motion, useReducedMotion} from 'motion/react';
import type {AppLocale} from '@/i18n/routing';

type HeroCopy = {
  kicker: string;
  title: string;
  description: string;
  primary: string;
  secondary: string;
  edition: string;
};

type HeroVisual = {
  primaryImage: string | null;
  secondaryImage: string | null;
  productName: string;
};

export function Hero({locale, copy, visual}: {locale: AppLocale; copy: HeroCopy; visual: HeroVisual}) {
  const reduceMotion = useReducedMotion();
  const rise = reduceMotion ? {} : {initial: {opacity: 0, y: 28}, animate: {opacity: 1, y: 0}};

  return (
    <section className="hero-shell">
      <motion.div className="hero-copy" {...rise} transition={{duration: 0.7, ease: [0.22, 1, 0.36, 1]}}>
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
        className="hero-art"
        initial={reduceMotion ? undefined : {opacity: 0, x: 26}}
        animate={reduceMotion ? undefined : {opacity: 1, x: 0}}
        transition={{duration: 0.9, delay: 0.05, ease: [0.22, 1, 0.36, 1]}}
      >
        <div className="hero-visual-grid">
          <div className="hero-art__frame hero-art__frame--primary">
            {visual.primaryImage ? (
              <Image
                src={visual.primaryImage}
                alt={visual.productName}
                fill
                sizes="(max-width: 900px) 92vw, 44vw"
                className="cover-image"
                priority
              />
            ) : <div className="hero-art__placeholder" aria-hidden="true" />}
          </div>
          <div className="hero-art__frame hero-art__frame--secondary">
            {visual.secondaryImage ? (
              <Image
                src={visual.secondaryImage}
                alt=""
                fill
                sizes="(max-width: 900px) 42vw, 18vw"
                className="cover-image"
              />
            ) : <div className="hero-art__placeholder" aria-hidden="true" />}
          </div>
          <div className="hero-monogram" aria-hidden="true">D</div>
          <span className="hero-edition">{copy.edition}</span>
        </div>
      </motion.div>
    </section>
  );
}
