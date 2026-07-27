'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';

export function OrderCancelButton({
  orderNumber,
  confirmationToken,
  cancelLabel,
  cancellingLabel,
  errorLabel
}: {
  orderNumber: string;
  confirmationToken?: string;
  cancelLabel: string;
  cancellingLabel: string;
  errorLabel: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function cancel() {
    setBusy(true);
    setError(false);
    try {
      const response = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({orderNumber, confirmationToken})
      });
      if (!response.ok) throw new Error('CANCEL_FAILED');
      router.refresh();
    } catch {
      setError(true);
      setBusy(false);
    }
  }

  return (
    <div>
      <button className="button button--ghost" type="button" disabled={busy} onClick={() => void cancel()}>
        {busy ? cancellingLabel : cancelLabel}
      </button>
      {error && <p role="alert">{errorLabel}</p>}
    </div>
  );
}
