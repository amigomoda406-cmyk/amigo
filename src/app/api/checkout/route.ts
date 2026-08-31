import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { clientWithToken } from '@/lib/sanity/client';
import { z } from 'zod';

// ─── Security: Dangerous chars pattern ───────────────────────────────────────
const DANGEROUS_PATTERN = /<script|javascript:|on\w+\s*=|<img|<svg|union\s+select|drop\s+table|insert\s+into|select\s+\*|\$where|\$gt|\$lt|\$ne|exec\(|eval\(|\.\.\/|\.\.\\|;\s*cat\s|cmd\/c|\{\{|\}\}|<%|%>/i;

const safeString = (min: number, max: number) =>
  z.string().min(min).max(max).refine(
    (val) => !DANGEROUS_PATTERN.test(val),
    { message: 'Input contains invalid characters' }
  );

// ─── Zod Validation Schema ────────────────────────────────────────────────────
// ✅ لا يُقبل أي طلب بدون هذه الحقول بالضبط + فحص أمني للحقول النصية
const CheckoutSchema = z.object({
  customer_name: safeString(2, 100),
  customer_phone: z.string().regex(/^(05|06|07)\d{8}$/, 'رقم الهاتف الجزائري غير صحيح'),
  wilaya: safeString(1, 100),
  wilaya_code: z.string().optional(),
  commune: safeString(1, 100),
  address: safeString(1, 200),
  delivery_type: z.enum(['home', 'bureau']).default('home'),
  delivery_fee: z.number().min(0).max(2000),
  total_amount: z.number().min(1).max(500000),
  items: z.array(z.object({
    productId: z.string().optional(),
    title: safeString(1, 200),
    price: z.number().min(1).max(200000),
    quantity: z.number().int().min(1).max(20),
    selectedSize: z.string().max(50).optional(),
    selectedColor: z.string().max(50).optional(),
  })).min(1).max(20),
});

// ─── Rate Limiting (In-Memory + Cloudflare WAF كطبقة أولى) ─────────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_WINDOW_MS = 60 * 1000; // 1 دقيقة
const MAX_REQUESTS = 5; // 5 طلبات كحد أقصى (رُفع لتمكين الاختبارات البنية)

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_REQUESTS) return true;
  record.count += 1;
  return false;
}

export async function POST(req: Request) {
  try {
    // ─── 1. IP Detection — Cloudflare أولاً (أكثر أماناً) ──────────────────
    const ip = req.headers.get('cf-connecting-ip')       // Cloudflare (الأفضل)
             || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
             || 'unknown';

    if (ip !== 'unknown' && isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      );
    }

    // ─── 2. التحقق من صحة البيانات (Zod) ────────────────────────────────────
    const body = await req.json();
    const parsed = CheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      customer_name, customer_phone, wilaya, wilaya_code, commune, address,
      delivery_type, delivery_fee, total_amount, items
    } = parsed.data;

    // ─── 3. توليد رقم طلب فريد (لا تكرار) ────────────────────────────────
    // timestamp + UUID جزئي = مستحيل التكرار
    const orderNumber = `AMIGO-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

    // ─── 3.5. إرسال الطلب إلى ECOTRACK ──────────────────────────────────
    let trackingNumber = '';
    try {
      const ecoTrackUrl = process.env.ECOTRACK_API_URL;
      const ecoTrackToken = process.env.ECOTRACK_API_TOKEN;
      if (ecoTrackUrl && ecoTrackToken) {
        const productNames = items.map((i: any) => `${i.quantity}x ${i.title}`).join(', ').substring(0, 255);
        const ecoPayload = {
          nom_client: customer_name,
          telephone: customer_phone,
          adresse: address,
          code_wilaya: wilaya_code || wilaya,
          commune: commune,
          montant: total_amount,
          produit: productNames,
          reference: orderNumber,
          type: 1, // 1 for normal delivery
          stop_desk: delivery_type === 'bureau' ? 1 : 0,
          poids: 2 // Fixed 2kg weight
        };

        const ecoRes = await fetch(`${ecoTrackUrl}/create/order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ecoTrackToken}`
          },
          body: JSON.stringify(ecoPayload)
        });
        
        if (ecoRes.ok) {
          const ecoData = await ecoRes.json();
          trackingNumber = ecoData.tracking || '';
        } else {
          console.error('[Checkout] Ecotrack error status:', ecoRes.status);
        }
      }
    } catch (ecoError) {
      console.error('[Checkout] Failed to send order to Ecotrack:', ecoError);
    }

    // ─── 4. حفظ الطلب في Sanity (المصدر الرئيسي) ─────────────────────────
    const sanityOrder = {
      _type: 'order',
      orderNumber,
      customerName: customer_name,
      customerPhone: customer_phone,
      wilaya,
      commune,
      address,
      totalAmount: total_amount,
      deliveryFee: delivery_fee,
      deliveryType: delivery_type,
      status: 'pending',
      items: items.map((item) => ({
        _key: crypto.randomUUID(),
        productName: item.title,
        quantity: item.quantity,
        price: item.price,
        selectedSize: item.selectedSize ?? '',
        selectedColor: item.selectedColor ?? '',
        ...(item.productId ? {
          productRef: { _type: 'reference', _ref: item.productId }
        } : {}),
      })),
    };

    // ✅ استخدام clientWithToken (ثابت، لا يُنشأ في كل طلب)
    const createdSanityOrder = await clientWithToken.create(sanityOrder);

    // ─── 5. حفظ في Supabase (Backup) ─────────────────────────────────────
    let supabaseOrderId: string | null = null;
    try {
      const subtotal = total_amount - delivery_fee;

      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert([{
          customer_name,
          customer_phone,
          customer_wilaya: wilaya,
          customer_address: `${commune}, ${address}`,
          delivery_type,
          items,
          subtotal,
          shipping_fee: delivery_fee,
          total: total_amount,
          status: 'pending',
          order_number: orderNumber,
        }])
        .select()
        .single();

      if (!orderError && order) {
        supabaseOrderId = order.id;
      } else if (orderError) {
        console.error('[Checkout] Supabase Error:', orderError.message);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown Supabase error';
      console.warn('[Checkout] Supabase backup failed:', msg);
    }
    // ─── 6. (تم إزالة تليجرام) ───────────────────────────────────────────────

    return NextResponse.json({
      success: true,
      orderId: createdSanityOrder._id,
      orderNumber,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Checkout] Fatal error:', message);
    return NextResponse.json({ success: false, error: 'Checkout failed' }, { status: 500 });
  }
}
