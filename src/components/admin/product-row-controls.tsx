'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import styles from './admin-shell.module.css';

type Status = 'draft' | 'active' | 'archived';

export function ProductRowControls({
  productId,
  initialStatus,
  initialNewArrival,
  labels
}: {
  productId: string;
  initialStatus: Status;
  initialNewArrival: boolean;
  labels: {
    draft: string;
    active: string;
    archived: string;
    newArrival: string;
    save: string;
    saving: string;
    saved: string;
    error: string;
  };
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [newArrival, setNewArrival] = useState(initialNewArrival);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function save() {
    setState('saving');
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({status, newArrival})
      });
      if (!response.ok) throw new Error('PRODUCT_UPDATE_FAILED');
      setState('saved');
      router.refresh();
    } catch {
      setState('error');
    }
  }

  return (
    <div className={styles.controls}>
      <select className={styles.select} value={status} onChange={(event) => { setStatus(event.target.value as Status); setState('idle'); }}>
        <option value="draft">{labels.draft}</option>
        <option value="active">{labels.active}</option>
        <option value="archived">{labels.archived}</option>
      </select>
      <label className={styles.controls}>
        <input type="checkbox" checked={newArrival} onChange={(event) => { setNewArrival(event.target.checked); setState('idle'); }} />
        <span className={styles.muted}>{labels.newArrival}</span>
      </label>
      <button className={styles.smallButton} type="button" disabled={state === 'saving'} onClick={() => void save()}>
        {state === 'saving' ? labels.saving : labels.save}
      </button>
      {state === 'saved' && <span className={styles.success}>{labels.saved}</span>}
      {state === 'error' && <span className={styles.error}>{labels.error}</span>}
    </div>
  );
}
