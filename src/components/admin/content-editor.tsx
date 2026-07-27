'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import type {AppLocale} from '@/i18n/routing';
import type {StorefrontContentKey} from '@/features/content/definitions';
import styles from './content-editor.module.css';

type Entry = {
  key: StorefrontContentKey;
  values: Record<AppLocale, string>;
  defaults: Record<AppLocale, string>;
  overridden: Record<AppLocale, boolean>;
};

type StateKey = `${StorefrontContentKey}:${AppLocale}`;

type EditorState = 'idle' | 'saving' | 'saved' | 'error';

export function ContentEditor({
  entries,
  localeLabels,
  labels
}: {
  entries: Entry[];
  localeLabels: Record<AppLocale, string>;
  labels: {
    save: string;
    reset: string;
    saving: string;
    saved: string;
    error: string;
    inherited: string;
    override: string;
  };
}) {
  const router = useRouter();
  const [values, setValues] = useState(() => Object.fromEntries(
    entries.flatMap((entry) => Object.entries(entry.values).map(([locale, value]) => [`${entry.key}:${locale}`, value]))
  ) as Record<StateKey, string>);
  const [overridden, setOverridden] = useState(() => Object.fromEntries(
    entries.flatMap((entry) => Object.entries(entry.overridden).map(([locale, value]) => [`${entry.key}:${locale}`, value]))
  ) as Record<StateKey, boolean>);
  const [states, setStates] = useState<Record<string, EditorState>>({});

  function defaultValue(key: StorefrontContentKey, locale: AppLocale) {
    return entries.find((entry) => entry.key === key)?.defaults[locale] ?? '';
  }

  async function save(key: StorefrontContentKey, locale: AppLocale) {
    const stateKey: StateKey = `${key}:${locale}`;
    const value = values[stateKey]?.trim();
    if (!value) {
      setStates((current) => ({...current, [stateKey]: 'error'}));
      return;
    }

    setStates((current) => ({...current, [stateKey]: 'saving'}));
    try {
      const response = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({key, locale, value})
      });
      if (!response.ok) throw new Error('CONTENT_UPDATE_FAILED');
      setValues((current) => ({...current, [stateKey]: value}));
      setOverridden((current) => ({...current, [stateKey]: true}));
      setStates((current) => ({...current, [stateKey]: 'saved'}));
      router.refresh();
    } catch {
      setStates((current) => ({...current, [stateKey]: 'error'}));
    }
  }

  async function reset(key: StorefrontContentKey, locale: AppLocale) {
    const stateKey: StateKey = `${key}:${locale}`;
    setStates((current) => ({...current, [stateKey]: 'saving'}));
    try {
      const response = await fetch('/api/admin/content', {
        method: 'DELETE',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({key, locale})
      });
      if (!response.ok) throw new Error('CONTENT_RESET_FAILED');
      setValues((current) => ({...current, [stateKey]: defaultValue(key, locale)}));
      setOverridden((current) => ({...current, [stateKey]: false}));
      setStates((current) => ({...current, [stateKey]: 'saved'}));
      router.refresh();
    } catch {
      setStates((current) => ({...current, [stateKey]: 'error'}));
    }
  }

  return (
    <div className={styles.list}>
      {entries.map((entry) => (
        <article className={styles.card} key={entry.key}>
          <div className={styles.key}>
            <strong>{entry.key}</strong>
            <span>{labels.override}</span>
          </div>
          <div className={styles.locales}>
            {(Object.keys(entry.values) as AppLocale[]).map((locale) => {
              const stateKey: StateKey = `${entry.key}:${locale}`;
              const state = states[stateKey] ?? 'idle';
              const isOverride = overridden[stateKey] ?? false;
              return (
                <label className={styles.field} key={locale}>
                  <span>
                    <strong>{localeLabels[locale]}</strong>
                    {!isOverride && <small>{labels.inherited}</small>}
                  </span>
                  <textarea
                    value={values[stateKey] ?? ''}
                    onChange={(event) => {
                      setValues((current) => ({...current, [stateKey]: event.target.value}));
                      setStates((current) => ({...current, [stateKey]: 'idle'}));
                    }}
                  />
                  <div className={styles.controls}>
                    <button className={styles.button} type="button" disabled={state === 'saving'} onClick={() => void save(entry.key, locale)}>
                      {state === 'saving' ? labels.saving : labels.save}
                    </button>
                    {isOverride && (
                      <button className={styles.button} type="button" disabled={state === 'saving'} onClick={() => void reset(entry.key, locale)}>
                        {labels.reset}
                      </button>
                    )}
                    {state === 'saved' && <span className={styles.success}>{labels.saved}</span>}
                    {state === 'error' && <span className={styles.error}>{labels.error}</span>}
                  </div>
                </label>
              );
            })}
          </div>
        </article>
      ))}
    </div>
  );
}
