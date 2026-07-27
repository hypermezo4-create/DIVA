'use client';

import {useTheme} from 'next-themes';

export function ThemeToggle({label}: {label: string}) {
  const {resolvedTheme, setTheme} = useTheme();
  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';

  return (
    <button className="icon-button" type="button" aria-label={label} onClick={() => setTheme(nextTheme)}>
      <span className="theme-icon theme-icon--sun">
        <SunIcon />
      </span>
      <span className="theme-icon theme-icon--moon">
        <MoonIcon />
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.3 15.3A8.5 8.5 0 0 1 8.7 3.7 8.5 8.5 0 1 0 20.3 15.3Z" />
    </svg>
  );
}
