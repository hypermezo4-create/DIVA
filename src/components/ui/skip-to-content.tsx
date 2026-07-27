'use client';

export function SkipToContent({label}: {label: string}) {
  function skip() {
    const main = document.querySelector<HTMLElement>('main');
    if (!main) return;
    if (!main.hasAttribute('tabindex')) main.tabIndex = -1;
    main.focus({preventScroll: true});
    main.scrollIntoView({block: 'start'});
  }

  return (
    <button className="skip-to-content" type="button" onClick={skip}>
      {label}
    </button>
  );
}
