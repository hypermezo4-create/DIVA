export function BrandMark({compact = false}: {compact?: boolean}) {
  return (
    <span className={compact ? 'brand-mark brand-mark--compact' : 'brand-mark'}>
      <span className="brand-copy">
        <strong>DIVA</strong>
        {!compact && <small>Premium Mirror</small>}
      </span>
    </span>
  );
}
