'use client';

import {useState, type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {authClient} from '@/lib/auth-client';

type AccountCopy = {
  signIn: string;
  signUp: string;
  name: string;
  email: string;
  password: string;
  loginAction: string;
  registerAction: string;
  switchToRegister: string;
  switchToLogin: string;
  signedInAs: string;
  signOut: string;
  working: string;
  genericError: string;
};

type AccountMode = 'sign-in' | 'sign-up';

export function AccountPanel({copy}: {copy: AccountCopy}) {
  const router = useRouter();
  const {data: session, isPending} = authClient.useSession();
  const [mode, setMode] = useState<AccountMode>('sign-in');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isPending) return <div className="account-status">{copy.working}</div>;

  if (session) {
    return (
      <div className="account-session">
        <p>{copy.signedInAs}</p>
        <strong>{session.user.name}</strong>
        <span>{session.user.email}</span>
        <button className="button button--ghost" type="button" onClick={() => void signOut()}>
          {copy.signOut}
        </button>
      </div>
    );
  }

  async function signOut() {
    await authClient.signOut();
    router.refresh();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');
    const name = String(form.get('name') ?? '');
    const response = mode === 'sign-in'
      ? await authClient.signIn.email({email, password})
      : await authClient.signUp.email({name, email, password});

    setSubmitting(false);
    if (response.error) {
      setError(response.error.message ?? copy.genericError);
      return;
    }

    router.refresh();
  }

  return (
    <div className="account-card">
      <div className="account-tabs" role="tablist" aria-label={`${copy.signIn} / ${copy.signUp}`}>
        <button type="button" className={mode === 'sign-in' ? 'is-active' : ''} onClick={() => setMode('sign-in')}>
          {copy.signIn}
        </button>
        <button type="button" className={mode === 'sign-up' ? 'is-active' : ''} onClick={() => setMode('sign-up')}>
          {copy.signUp}
        </button>
      </div>

      <form className="account-form" onSubmit={(event) => void submit(event)}>
        {mode === 'sign-up' && (
          <label>
            <span>{copy.name}</span>
            <input name="name" type="text" autoComplete="name" required maxLength={120} />
          </label>
        )}
        <label>
          <span>{copy.email}</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          <span>{copy.password}</span>
          <input
            name="password"
            type="password"
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            required
            minLength={8}
            maxLength={128}
          />
        </label>

        {error && <p className="account-error" role="alert">{error}</p>}

        <button className="button button--primary" type="submit" disabled={submitting}>
          {submitting ? copy.working : mode === 'sign-in' ? copy.loginAction : copy.registerAction}
        </button>
      </form>

      <button
        className="account-switch"
        type="button"
        onClick={() => setMode((current) => current === 'sign-in' ? 'sign-up' : 'sign-in')}
      >
        {mode === 'sign-in' ? copy.switchToRegister : copy.switchToLogin}
      </button>
    </div>
  );
}
