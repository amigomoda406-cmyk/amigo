/**
 * /api/delivery-settings — GET public, PUT/POST protected
 * يوفر التوافق مع اختبارات الأمان
 */
import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { verifyAdminAuth } from '@/lib/auth/verifyAdmin';

// Default delivery settings
const DEFAULTS = {
  home_delivery_price: 800,
  office_delivery_price: 400,
  free_delivery_threshold: 15000,
  currency: 'DZD',
};

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('shipping_rates')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(DEFAULTS, {
        headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
      });
    }

    return NextResponse.json({
      home_delivery_price: data.home_fee ?? DEFAULTS.home_delivery_price,
      office_delivery_price: data.desk_fee ?? DEFAULTS.office_delivery_price,
      free_delivery_threshold: data.free_threshold ?? DEFAULTS.free_delivery_threshold,
      currency: 'DZD',
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json(DEFAULTS);
  }
}

export async function PUT(req: NextRequest) {
  // Requires admin auth
  const authResult = await verifyAdminAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const { home_delivery_price, office_delivery_price } = body as Record<string, unknown>;
    if (typeof home_delivery_price !== 'number' || home_delivery_price < 0) {
      return NextResponse.json({ error: 'Invalid home_delivery_price' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('shipping_rates').upsert({
      wilaya: 'default',
      home_fee: home_delivery_price,
      desk_fee: office_delivery_price ?? 400,
    });

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
