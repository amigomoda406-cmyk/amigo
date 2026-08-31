// src/app/api/revalidate/route.ts
// ✅ Sanity Webhook يضرب هنا عند تعديل أي منتج/قسم → يمسح الكاش فوراً
// الاستخدام: أضف هذا الرابط في Sanity → API → Webhooks

import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { invalidateProduct, invalidateCategory, invalidateAll } from '@/lib/sanity/queries';

export async function POST(req: Request) {
  // ── 1. التحقق من أن الطلب قادم من Sanity عبر query param ────────────────
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const expectedSecret = process.env.SANITY_WEBHOOK_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── 2. قراءة بيانات التحديث ───────────────────────────────────────────────
  let body: { _type?: string; slug?: { current?: string }; _id?: string; categoryId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { _type, slug, categoryId } = body;

  try {
    // ── 3. مسح الكاش المناسب بحسب نوع المستند ───────────────────────────────
    if (_type === 'product' && slug?.current) {
      // مسح كاش منتج واحد
      // @ts-expect-error Next.js canary typings issue
      revalidateTag(`product-${slug.current}`);
      revalidatePath(`/products/${slug.current}`, 'page');
      await invalidateProduct(slug.current, categoryId);
    }

    else if (_type === 'category' && slug?.current) {
      // مسح كاش قسم كامل
      // @ts-expect-error Next.js canary typings issue
      revalidateTag(`category-${slug.current}`);
      revalidatePath(`/category/${slug.current}`, 'page');
      await invalidateCategory(slug.current);
    }

    else if (_type === 'homePage') {
      // مسح كاش الصفحة الرئيسية
      // @ts-expect-error Next.js canary typings issue
      revalidateTag('home');
      revalidatePath('/', 'page');
      await invalidateAll();
    }

    else {
      // أي تحديث آخر → امسح كل شيء (آمن)
      // @ts-expect-error Next.js canary typings issue
      revalidateTag('products');
      // @ts-expect-error Next.js canary typings issue
      revalidateTag('categories');
      // @ts-expect-error Next.js canary typings issue
      revalidateTag('home');
      revalidatePath('/', 'layout');
      await invalidateAll();
    }

    return NextResponse.json({
      success: true,
      revalidated: _type,
      slug: slug?.current,
      timestamp: new Date().toISOString(),
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Revalidate] Error:', message);
    return NextResponse.json({ error: 'Revalidation failed', details: message }, { status: 500 });
  }
}
