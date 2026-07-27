import Image from 'next/image';

export function BrandMark({compact = false}: {compact?: boolean}) {
  return (
    <span className={compact ? 'brand-mark brand-mark--compact' : 'brand-mark'}>
      <Image
        src={compact ? '/brand/diva-logo-original-mark.svg' : '/brand/diva-logo-original-full.svg'}
        alt="DIVA Premium Mirror luxury footwear"
        width={compact ? 180 : 360}
        height={compact ? 188 : 441}
        priority
      />
    </span>
  );
}
