import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { verifyAdminAuth } from '@/lib/auth/verifyAdmin';

const ALLOWED_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const MAX_LIMIT = 100;

export async function GET(req: NextRequest) {
  try {
    // ─── Auth Guard (CRITICAL - لا يمكن تخطيه) ──────────────────────────────
    const authResult = await verifyAdminAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    // ─── Query Params (sanitized) ────────────────────────────────────────────
    const { searchParams } = new URL(req.url);

    const rawStatus = searchParams.get('status') || '';
    const status = ALLOWED_STATUSES.includes(rawStatus) ? rawStatus : null;

    const rawLimit = parseInt(searchParams.get('limit') || '50', 10);
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 50 : Math.min(rawLimit, MAX_LIMIT);

    const rawPage = parseInt(searchParams.get('page') || '1', 10);
    const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // ─── Build Query ────────────────────────────────────────────────────────
    let query = supabaseAdmin
      .from('orders')
      .select('id, customer_name, customer_phone, customer_wilaya, delivery_type, total, status, created_at, order_number', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('[Admin Orders] DB Error:', error.message);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      orders: orders || [],
      total: count ?? 0,
      page,
      limit,
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Admin Orders] Fatal:', msg);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Reject all other methods explicitly
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
