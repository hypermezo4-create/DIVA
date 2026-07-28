'use client';

import Image from 'next/image';
import {useState} from 'react';

type ProductGalleryImage = {
  url: string;
  altText: string | null;
};

export function ProductGallery({
  name,
  images
}: {
  name: string;
  images: ProductGalleryImage[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  if (!active) {
    return <div className="product-gallery product-gallery--empty" aria-hidden="true" />;
  }

  return (
    <div className="product-gallery" aria-label={name}>
      <div className="product-gallery__stage" aria-live="polite">
        <Image
          key={active.url}
          src={active.url}
          alt={active.altText ?? name}
          fill
          sizes="(max-width: 900px) 100vw, 58vw"
          className="cover-image"
          priority
        />
        {images.length > 1 && (
          <span className="product-gallery__counter" aria-hidden="true">
            {String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="product-gallery__rail" role="group" aria-label={name}>
          {images.map((image, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={`${image.url}-${index}`}
                type="button"
                className={`product-gallery__thumb${selected ? ' is-active' : ''}`}
                aria-pressed={selected}
                aria-label={`${name} ${index + 1}`}
                onClick={() => setActiveIndex(index)}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="96px"
                  className="cover-image"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
