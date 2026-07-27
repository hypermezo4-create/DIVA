import {revalidatePath} from 'next/cache';
import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {getAdminSession} from '@/features/admin/access';
import {isStorefrontContentKey} from '@/features/content/definitions';
import {setStorefrontContent} from '@/features/content/repository';
import {isAppLocale} from '@/i18n/routing';

const schema = z.object({
  locale: z.string(),
  key: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(2000)
});

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession(request.headers);
  if (!session) return NextResponse.json({error: 'FORBIDDEN'}, {status: 403});

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isAppLocale(parsed.data.locale) || !isStorefrontContentKey(parsed.data.key)) {
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
