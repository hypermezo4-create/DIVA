import Image from 'next/image';

export function BrandMark({compact = false}: {compact?: boolean}) {
  return (
    <span className={compact ? 'brand-mark brand-mark--compact' : 'brand-mark'}>
      <Image
        src="/brand/diva-mark.svg"
        alt="DIVA Premium Mirror luxury footwear"
        width={96}
        height={96}
        priority
      />
      {!compact && (
        <span className="brand-copy" aria-hidden="true">
          <strong>DIVA</strong>
          <small>Premium Mirror</small>
        </span>
      )}
    </span>
  );
}
