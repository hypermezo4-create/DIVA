'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import styles from './admin-shell.module.css';

type Target = 'cancelled' | 'processing' | 'shipped' | 'delivered';

export function OrderRowControls({
  orderId,
  target,
  label,
  working,
  saved,
  error
}: {
  orderId: string;
  target: Target | null;
  label: string;
  working: string;
  saved: string;
  error: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  if (!target) return null;

  async function transition() {
    setState('saving');
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({target})
      });
      if (!response.ok) throw new Error('ORDER_UPDATE_FAILED');
      setState('saved');
      router.refresh();
    } catch {
      setState('error');
    }
  }

  return (
    <div className={styles.controls}>
      <button
        className={`${styles.smallButton} ${target === 'cancelled' ? styles.dangerButton : ''}`}
        type="button"
        disabled={state === 'saving'}
        onClick={() => void transition()}
      >
        {state === 'saving' ? working : label}
      </button>
      {state === 'saved' && <span className={styles.success}>{saved}</span>}
      {state === 'error' && <span className={styles.error}>{error}</span>}
    </div>
  );
}
