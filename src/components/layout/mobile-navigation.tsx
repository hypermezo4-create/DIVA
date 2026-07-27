'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import type {AppLocale} from '@/i18n/routing';
import styles from './site-header.module.css';

type MobileLink = {
  href: string;
  label: string;
};

function MenuIcon({open}: {open: boolean}) {
  return (
    <span className={`${styles.menuGlyph} ${open ? styles.menuGlyphOpen : ''}`} aria-hidden="true">
      <i />
      <i />
    </span>
  );
}

export function MobileNavigation({
  locale,
  menuLabel,
  closeLabel,
  homeLabel,
  shopLabel,
  accountLabel,
  links
}: {
  locale: AppLocale;
  menuLabel: string;
  closeLabel: string;
  homeLabel: string;
  shopLabel: string;
  accountLabel: string;
  links: MobileLink[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        className={styles.menuButton}
        type="button"
        aria-label={open ? closeLabel : menuLabel}
        aria-expanded={open}
        aria-controls="mobile-navigation-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <MenuIcon open={open} />
      </button>

      <div className={`${styles.mobileNavLayer} ${open ? styles.mobileNavLayerOpen : ''}`} aria-hidden={!open}>
        <button className={styles.mobileNavBackdrop} type="button" aria-label={closeLabel} onClick={close} tabIndex={open ? 0 : -1} />
        <nav id="mobile-navigation-panel" className={styles.mobileNavPanel} aria-label={menuLabel}>
          <div className={styles.mobileNavTopline}>
            <span>DIVA · PRIVATE CLIENT</span>
            <button type="button" onClick={close}>{closeLabel}</button>
          </div>
          <div className={styles.mobileNavPrimary}>
            <Link href={`/${locale}`} onClick={close}>{homeLabel}</Link>
            {links.map((link) => (
              <Link href={link.href} key={link.href} onClick={close}>{link.label}</Link>
            ))}
          </div>
          <div className={styles.mobileNavUtility}>
            <Link href={`/${locale}/shop`} onClick={close}>{shopLabel}</Link>
            <Link href={`/${locale}/account`} onClick={close}>{accountLabel}</Link>
          </div>
        </nav>
      </div>
    </>
  );
}
