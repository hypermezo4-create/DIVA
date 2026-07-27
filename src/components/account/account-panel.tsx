'use client';

import {useState, type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {authClient} from '@/lib/auth-client';
import styles from './account-panel.module.css';

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
type Credentials = {name: string; email: string; password: string};

function readCredentials(form: HTMLFormElement): Credentials {
  const fields = new FormData(form);
  return {
    name: String(fields.get('name') ?? ''),
    email: String(fields.get('email') ?? ''),
    password: String(fields.get('password') ?? '')
  };
}

function AccountTabs({mode, copy, onChange}: {mode: AccountMode; copy: AccountCopy; onChange: (mode: AccountMode) => void}) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={`${copy.signIn} / ${copy.signUp}`}>
      <button type="button" className={mode === 'sign-in' ? styles.active : ''} onClick={() => onChange('sign-in')}>
        {copy.signIn}
      </button>
      <button type="button" className={mode === 'sign-up' ? styles.active : ''} onClick={() => onChange('sign-up')}>
        {copy.signUp}
      </button>
    </div>
  );
}

function AccountSession({copy, name, email, onSignOut}: {copy: AccountCopy; name: string; email: string; onSignOut: () => void}) {
  return (
    <div className={styles.session}>
      <p>{copy.signedInAs}</p>
      <strong>{name}</strong>
      <span>{email}</span>
      <button className="button button--ghost" type="button" onClick={onSignOut}>{copy.signOut}</button>
    </div>
  );
}

export function AccountPanel({copy}: {copy: AccountCopy}) {
  const router = useRouter();
  const {data: session, isPending} = authClient.useSession();
  const [mode, setMode] = useState<AccountMode>('sign-in');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    await authClient.signOut();
    router.refresh();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const credentials = readCredentials(event.currentTarget);
    const response = mode === 'sign-in'
      ? await authClient.signIn.email(credentials)
      : await authClient.signUp.email(credentials);
    setSubmitting(false);
    if (response.error) return setError(response.error.message ?? copy.genericError);
    router.refresh();
  }

  if (isPending) return <div className={styles.status}>{copy.working}</div>;
  if (session) {
    return <AccountSession copy={copy} name={session.user.name} email={session.user.email} onSignOut={() => void signOut()} />;
  }

  return (
    <div className={styles.card}>
      <AccountTabs mode={mode} copy={copy} onChange={setMode} />
      <form className={styles.form} onSubmit={(event) => void submit(event)}>
        {mode === 'sign-up' && <TextField label={copy.name} name="name" autoComplete="name" />}
        <TextField label={copy.email} name="email" type="email" autoComplete="email" />
        <TextField
          label={copy.password}
          name="password"
          type="password"
          autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
          minLength={8}
          maxLength={128}
        />
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button className="button button--primary" type="submit" disabled={submitting}>
          {submitting ? copy.working : mode === 'sign-in' ? copy.loginAction : copy.registerAction}
        </button>
      </form>
      <button className={styles.switch} type="button" onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}>
        {mode === 'sign-in' ? copy.switchToRegister : copy.switchToLogin}
      </button>
    </div>
  );
}

type TextFieldProps = {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password';
  autoComplete: string;
  minLength?: number;
  maxLength?: number;
};

function TextField({label, name, type = 'text', autoComplete, minLength, maxLength}: TextFieldProps) {
  return (
    <label>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        minLength={minLength}
        maxLength={maxLength ?? 120}
      />
    </label>
  );
}
