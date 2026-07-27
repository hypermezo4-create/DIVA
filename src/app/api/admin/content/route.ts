import {revalidatePath} from 'next/cache';
import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {getAdminSession} from '@/features/admin/access';
import {
  isStorefrontContentKey,
  type StorefrontContentKey
} from '@/features/content/definitions';
import {deleteStorefrontContent, setStorefrontContent} from '@/features/content/repository';
import {isAppLocale, type AppLocale} from '@/i18n/routing';
import {isTrustedMutationRequest} from '@/lib/request-security';

const identitySchema = z.object({
  locale: z.string(),
  key: z.string().trim().min(1).max(120)
});

const updateSchema = identitySchema.extend({
  value: z.string().trim().min(1).max(2000)
});

type ValidContentIdentity = {
  locale: AppLocale;
  key: StorefrontContentKey;
};

function isValidIdentity(value: {locale: string; key: string}): value is ValidContentIdentity {
  return isAppLocale(value.locale) && isStorefrontContentKey(value.key);
}

function rejectCrossSite(request: NextRequest) {
  return isTrustedMutationRequest(request)
    ? null
    : NextResponse.json({error: 'CROSS_SITE_REQUEST'}, {status: 403});
}

export async function PATCH(request: NextRequest) {
  const crossSite = rejectCrossSite(request);
  if (crossSite) return crossSite;

  const session = await getAdminSession(request.headers);
  if (!session) return NextResponse.json({error: 'FORBIDDEN'}, {status: 403});

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isValidIdentity(parsed.data)) {
    return NextResponse.json({error: 'INVALID_CONTENT_UPDATE'}, {status: 400});
  }

  const content = await setStorefrontContent({
    locale: parsed.data.locale,
    key: parsed.data.key,
    value: parsed.data.value,
    updatedBy: session.user.id
  });
  revalidatePath(`/${parsed.data.locale}`, 'layout');
  return NextResponse.json({content});
}

export async function DELETE(request: NextRequest) {
  const crossSite = rejectCrossSite(request);
  if (crossSite) return crossSite;

  const session = await getAdminSession(request.headers);
  if (!session) return NextResponse.json({error: 'FORBIDDEN'}, {status: 403});

  const parsed = identitySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isValidIdentity(parsed.data)) {
    return NextResponse.json({error: 'INVALID_CONTENT_RESET'}, {status: 400});
  }

  await deleteStorefrontContent(parsed.data.key, parsed.data.locale);
  revalidatePath(`/${parsed.data.locale}`, 'layout');
  return NextResponse.json({reset: true});
}
