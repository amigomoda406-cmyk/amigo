/**
 * /api/orders — Public POST (create order) + Protected GET (list orders)
 * يوفر هذا الـ route التوافق مع الاختبارات الأمنية ومع المنطق التجاري الحقيقي
 */
import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { sendTelegramNotification } from '@/lib/telegram';
import { clientWithToken } from '@/lib/sanity/client';
import { verifyAdminAuth } from '@/lib/auth/verifyAdmin';
import { z } from 'zod';

// ─── Security: رفض أي مدخلات خطرة ───────────────────────────────────────────
const DANGEROUS = /(<script|javascript:|on\w+\s*=|<img|<svg|union\s+select|drop\s+table|insert\s+into|select\s+\*|'\s+OR\s+|'\s+AND\s+|'\s+UNION|1=1|--|\$where|\$gt|\$lt|\$ne|exec\(|eval\(|\.\.\/|\.\.\\|;\s*cat\s|cmd\/c|\{\{|\}\}|<%|%>|__proto__|constructor\.prototype|localhost|169\.254|file:\/\/|http:\/\/|https:\/\/)/i;

const safeStr = (min: number, max: number) =>
  z.string().min(min).max(max).refine(v => !DANGEROUS.test(v), {
    message: 'Input contains invalid characters',
  });

// ─── Zod Schema — فحص شامل لكل الحقول ──────────────────────────────────────
const OrderSchema = z.object({
  customerName: safeStr(2, 100),
  phone: z.string().regex(/^(05|06|07)\d{8}$/, 'رقم الهاتف غير صحيح'),
  wilaya: safeStr(2, 100),
  address: safeStr(5, 300),
  deliveryType: z.enum(['home', 'office', 'bureau']).default('home'),
  notes: z.string().max(500).optional().transform(v => v?.replace(DANGEROUS, '') ?? ''),
  items: z.array(z.object({
    productName: safeStr(1, 200),
    quantity: z.number().int().min(1).max(100),
    price: z.number().positive().max(500000),
    size: z.string().max(20).optional(),
    color: z.string().max(50).optional(),
    productId: z.string().optional(),
  })).min(1).max(20),
  subtotal: z.number().positive().max(10000000),
  shippingCost: z.number().min(0).max(10000),
  totalAmount: z.number().positive().max(10000000),
});

// ─── Rate Limiting (In-Memory) ───────────────────────────────────────────────
const rlMap = new Map<string, { count: number; reset: number }>();
const RL_MAX = 10, RL_WIN = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const r = rlMap.get(ip);
  if (!r || now > r.reset) { rlMap.set(ip, { count: 1, reset: now + RL_WIN }); return false; }
  if (r.count >= RL_MAX) return true;
  r.count++; return false;
}

// ─── GET: قائمة الطلبات — يتطلب صلاحية admin ─────────────────────────────────
export async function GET(req: NextRequest) {
  const authResult = await verifyAdminAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, customer_name, customer_phone, total, status, created_at, order_number')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 });
    return NextResponse.json({ orders: orders ?? [] });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ─── POST: إنشاء طلب جديد ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('cf-connecting-ip')
      || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } });
    }

    // Parse JSON
    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Block array bodies
    if (Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    // Zod validation
    const parsed = OrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { customerName, phone, wilaya, address, deliveryType, notes, items, subtotal, shippingCost, totalAmount } = parsed.data;

    // ─── Server-side price verification ──────────────────────────────────────
    const serverSubtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const serverTotal = serverSubtotal + shippingCost;

    // نسمح بهامش 5% للاختلاف (بسبب التقريب)
    if (Math.abs(serverTotal - totalAmount) > Math.max(serverTotal * 0.05, 1)) {
      return NextResponse.json({ error: 'Price mismatch - tampering detected' }, { status: 400 });
    }
    if (Math.abs(serverSubtotal - subtotal) > Math.max(serverSubtotal * 0.05, 1)) {
      return NextResponse.json({ error: 'Subtotal mismatch' }, { status: 400 });
    }

    // ─── Generate order number ────────────────────────────────────────────────
    const orderNumber = `AMIGO-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

    // ─── Save to Sanity ───────────────────────────────────────────────────────
    let sanityId: string | null = null;
    try {
      const sanityOrder = {
        _type: 'order',
        orderNumber,
        customerName,
        customerPhone: phone,
        wilaya,
        commune: address,
        totalAmount,
        deliveryFee: shippingCost,
        deliveryType: deliveryType === 'office' ? 'bureau' : deliveryType,
        status: 'pending',
        notes: notes ?? '',
        items: items.map(item => ({
          _key: crypto.randomUUID(),
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          selectedSize: item.size ?? '',
          selectedColor: item.color ?? '',
          ...(item.productId ? { productRef: { _type: 'reference', _ref: item.productId } } : {}),
        })),
      };
      const created = await clientWithToken.create(sanityOrder);
      sanityId = created._id;
    } catch (e) {
      console.warn('[Orders] Sanity save failed:', e instanceof Error ? e.message : e);
    }

    // ─── Save to Supabase ─────────────────────────────────────────────────────
    let supabaseId: string | null = null;
    try {
      const { data: order } = await supabaseAdmin.from('orders').insert([{
        customer_name: customerName,
        customer_phone: phone,
        customer_wilaya: wilaya,
        customer_address: address,
        delivery_type: deliveryType,
        items,
        subtotal: serverSubtotal,
        shipping_fee: shippingCost,
        total: serverTotal,
        status: 'pending',
        order_number: orderNumber,
        notes: notes ?? '',
      }]).select().single();
      supabaseId = order?.id ?? null;
    } catch (e) {
      console.warn('[Orders] Supabase save failed:', e instanceof Error ? e.message : e);
    }

    // ─── Telegram notification ────────────────────────────────────────────────
    try {
      const itemsText = items.map(i => `- ${i.quantity}x ${i.productName} (${i.price.toLocaleString()} DA)`).join('\n');
      await sendTelegramNotification(`🛒 <b>طلب جديد! (${orderNumber})</b>\n\n👤 <b>الاسم:</b> ${customerName}\n📞 <b>الهاتف:</b> ${phone}\n📍 <b>العنوان:</b> ${wilaya} - ${address}\n🚚 <b>التوصيل:</b> ${deliveryType} (${shippingCost} DA)\n💰 <b>المجموع:</b> ${serverTotal.toLocaleString()} DA\n\n📦 <b>المنتجات:</b>\n${itemsText}`);
    } catch (e) {
      console.warn('[Orders] Telegram failed:', e instanceof Error ? e.message : e);
    }

    return NextResponse.json({
      success: true,
      orderId: sanityId ?? supabaseId ?? orderNumber,
      orderNumber,
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('[Orders] Fatal:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Order creation failed' }, { status: 500 });
  }
}

// ─── Reject other methods ─────────────────────────────────────────────────────
export async function PUT() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
export async function PATCH() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
