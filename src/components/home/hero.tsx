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

export function Hero({locale, copy}: {locale: AppLocale; copy: HeroCopy}) {
  const reduceMotion = useReducedMotion();
  const rise = reduceMotion ? {} : {initial: {opacity: 0, y: 24}, animate: {opacity: 1, y: 0}};

  return (
    <section className="hero-shell">
      <div className="hero-orb hero-orb--one" />
      <div className="hero-orb hero-orb--two" />

      <motion.div className="hero-copy" {...rise} transition={{duration: 0.75, ease: [0.22, 1, 0.36, 1]}}>
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
      </motion.div>

      <motion.div
        className="hero-art"
        initial={reduceMotion ? undefined : {opacity: 0, scale: 0.96}}
        animate={reduceMotion ? undefined : {opacity: 1, scale: 1}}
        transition={{duration: 1, delay: 0.08, ease: [0.22, 1, 0.36, 1]}}
      >
        <div className="hero-art__frame">
          <Image
            src="/brand/diva-mark.svg"
            alt="DIVA logo in champagne gold"
            fill
            sizes="(max-width: 900px) 86vw, 42vw"
            className="hero-logo-image"
            priority
          />
          <span className="hero-edition">{copy.edition}</span>
        </div>
      </motion.div>
    </section>
  );
}
