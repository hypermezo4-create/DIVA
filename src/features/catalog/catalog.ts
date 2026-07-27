import type {AppLocale} from '@/i18n/routing';
import {catalogFilters, type CatalogFilter, type CatalogProduct} from './types';

const sharedColors = {
  espresso: {hex: '#3a2419', label: {en: 'Espresso', ar: 'إسبريسو', de: 'Espresso', ru: 'Эспрессо'}},
  ivory: {hex: '#efe4d3', label: {en: 'Ivory', ar: 'عاجي', de: 'Elfenbein', ru: 'Слоновая кость'}},
  black: {hex: '#161310', label: {en: 'Black', ar: 'أسود', de: 'Schwarz', ru: 'Чёрный'}},
  gold: {hex: '#b98a43', label: {en: 'Champagne Gold', ar: 'ذهبي شامبانيا', de: 'Champagnergold', ru: 'Золото шампань'}},
  burgundy: {hex: '#5b1f2b', label: {en: 'Burgundy', ar: 'عنابي', de: 'Burgunder', ru: 'Бордовый'}}
} as const;

export const catalogProducts: readonly CatalogProduct[] = [
  {
    slug: 'milano-court-01',
    audience: 'men',
    family: 'sneaker',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=88',
    gallery: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=88',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=1400&q=88'
    ],
    newArrival: true,
    collection: 'city',
    sizes: ['40', '41', '42', '43', '44'],
    colors: [sharedColors.ivory, sharedColors.espresso],
    copy: {
      en: {name: 'Milano Court 01', subtitle: 'City sneaker', description: 'A clean court silhouette with a sculpted sole and understated detailing for polished everyday movement.'},
      ar: {name: 'Milano Court 01', subtitle: 'سنيكرز للمدينة', description: 'تصميم كورت نظيف بنعل منحوت وتفاصيل هادئة يمنح الإطلالة اليومية لمسة مصقولة.'},
      de: {name: 'Milano Court 01', subtitle: 'City-Sneaker', description: 'Eine klare Court-Silhouette mit skulpturaler Sohle und dezenten Details für einen eleganten Alltag.'},
      ru: {name: 'Milano Court 01', subtitle: 'Городские кеды', description: 'Лаконичный силуэт с выразительной подошвой и сдержанными деталями для современного повседневного образа.'}
    }
  },
  {
    slug: 'aurelia-08',
    audience: 'women',
    family: 'heel',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1400&q=88',
    gallery: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1400&q=88',
      'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=1400&q=88'
    ],
    newArrival: true,
    collection: 'mirror',
    sizes: ['36', '37', '38', '39', '40'],
    colors: [sharedColors.gold, sharedColors.black],
    copy: {
      en: {name: 'Aurelia 08', subtitle: 'Sculpted heel', description: 'A refined pointed profile balanced by a confident sculpted heel and a luminous evening finish.'},
      ar: {name: 'Aurelia 08', subtitle: 'كعب منحوت', description: 'مقدمة راقية بخط مدبب تتوازن مع كعب منحوت واثق ولمسة لامعة تناسب السهرات.'},
      de: {name: 'Aurelia 08', subtitle: 'Skulpturaler Absatz', description: 'Eine elegante spitze Form mit markantem Absatz und einem leuchtenden Finish für den Abend.'},
      ru: {name: 'Aurelia 08', subtitle: 'Скульптурный каблук', description: 'Утончённый острый силуэт, выразительный каблук и мягкое сияние для вечернего образа.'}
    }
  },
  {
    slug: 'noir-loafer-03',
    audience: 'men',
    family: 'loafer',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1400&q=88',
    gallery: [
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1400&q=88',
      'https://images.unsplash.com/photo-1612181346599-a6bfbd67be86?auto=format&fit=crop&w=1400&q=88'
    ],
    newArrival: false,
    collection: 'mirror',
    sizes: ['40', '41', '42', '43', '44'],
    colors: [sharedColors.black, sharedColors.espresso],
    copy: {
      en: {name: 'Noir Loafer 03', subtitle: 'Leather loafer', description: 'A streamlined loafer with a low profile, softened structure and a polished finish that moves between tailoring and denim.'},
      ar: {name: 'Noir Loafer 03', subtitle: 'لوفر جلد', description: 'لوفر بانسيابية هادئة وبناء مرن وتشطيب مصقول يناسب الإطلالات الرسمية والكاجوال.'},
      de: {name: 'Noir Loafer 03', subtitle: 'Leder-Loafer', description: 'Ein schlanker Loafer mit weicher Konstruktion und poliertem Finish für Anzug und Denim.'},
      ru: {name: 'Noir Loafer 03', subtitle: 'Кожаные лоферы', description: 'Лаконичные лоферы с мягкой конструкцией и полированной отделкой для костюма и денима.'}
    }
  },
  {
    slug: 'celeste-line-02',
    audience: 'women',
    family: 'sandal',
    image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=1400&q=88',
    gallery: ['https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=1400&q=88'],
    newArrival: true,
    collection: 'city',
    sizes: ['36', '37', '38', '39', '40'],
    colors: [sharedColors.ivory, sharedColors.gold],
    copy: {
      en: {name: 'Celeste Line 02', subtitle: 'Minimal sandal', description: 'Slim straps, a balanced footbed and a restrained metallic accent create an effortless warm-weather signature.'},
      ar: {name: 'Celeste Line 02', subtitle: 'صندل مينيمال', description: 'سيور رفيعة وقاعدة متوازنة ولمسة معدنية هادئة تصنع توقيعًا أنيقًا للأيام الدافئة.'},
      de: {name: 'Celeste Line 02', subtitle: 'Minimalistische Sandale', description: 'Schmale Riemen, ein ausgewogenes Fußbett und ein dezenter Metallakzent für warme Tage.'},
      ru: {name: 'Celeste Line 02', subtitle: 'Минималистичные сандалии', description: 'Тонкие ремешки, выверенная колодка и деликатный металлический акцент для тёплого сезона.'}
    }
  },
  {
    slug: 'junior-court-05',
    audience: 'kids',
    family: 'sneaker',
    image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1400&q=88',
    gallery: ['https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1400&q=88'],
    newArrival: true,
    collection: 'city',
    sizes: ['28', '29', '30', '31', '32', '33', '34'],
    colors: [sharedColors.ivory, sharedColors.burgundy],
    copy: {
      en: {name: 'Junior Court 05', subtitle: 'Kids sneaker', description: 'A lightweight everyday sneaker with a supportive profile and clean details designed for busy little steps.'},
      ar: {name: 'Junior Court 05', subtitle: 'سنيكرز أطفال', description: 'سنيكرز يومي خفيف ببناء داعم وتفاصيل نظيفة يناسب الحركة المستمرة والخطوات الصغيرة.'},
      de: {name: 'Junior Court 05', subtitle: 'Kinder-Sneaker', description: 'Ein leichter Alltagssneaker mit stützender Form und klaren Details für aktive kleine Schritte.'},
      ru: {name: 'Junior Court 05', subtitle: 'Детские кеды', description: 'Лёгкая повседневная модель с поддерживающим силуэтом и чистыми деталями для активных детей.'}
    }
  },
  {
    slug: 'mini-mirror-04',
    audience: 'kids',
    family: 'boot',
    image: 'https://images.unsplash.com/photo-1554139844-af2fc8ad3a3a?auto=format&fit=crop&w=1400&q=88',
    gallery: ['https://images.unsplash.com/photo-1554139844-af2fc8ad3a3a?auto=format&fit=crop&w=1400&q=88'],
    newArrival: false,
    collection: 'mirror',
    sizes: ['29', '30', '31', '32', '33', '34'],
    colors: [sharedColors.espresso, sharedColors.black],
    copy: {
      en: {name: 'Mini Mirror 04', subtitle: 'Kids ankle boot', description: 'A compact ankle boot with a soft structure, stable sole and polished finish inspired by the DIVA Mirror line.'},
      ar: {name: 'Mini Mirror 04', subtitle: 'بوت أطفال قصير', description: 'بوت قصير ببناء مريح ونعل ثابت وتشطيب مصقول مستوحى من مجموعة DIVA Mirror.'},
      de: {name: 'Mini Mirror 04', subtitle: 'Kinder-Stiefelette', description: 'Eine kompakte Stiefelette mit weicher Struktur, stabiler Sohle und poliertem Finish aus der DIVA Mirror Linie.'},
      ru: {name: 'Mini Mirror 04', subtitle: 'Детские ботинки', description: 'Компактные ботинки с мягкой конструкцией, устойчивой подошвой и отделкой в духе линии DIVA Mirror.'}
    }
  }
];

export function isCatalogFilter(value: string | undefined): value is CatalogFilter {
  return value !== undefined && catalogFilters.includes(value as CatalogFilter);
}

export function listCatalogProducts(filter: CatalogFilter = 'all') {
  if (filter === 'all') return catalogProducts;
  if (filter === 'offers') return [];
  return catalogProducts.filter((product) => product.audience === filter);
}

export function findCatalogProduct(slug: string) {
  return catalogProducts.find((product) => product.slug === slug);
}

export function localizeProduct(product: CatalogProduct, locale: AppLocale) {
  return product.copy[locale];
}
