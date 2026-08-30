import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { verifyAdminAuth } from '@/lib/auth/verifyAdmin';

const ALLOWED_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ─── Auth Guard ──────────────────────────────────────────────────────────
    const authResult = await verifyAdminAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { status } = await req.json();
    const resolvedParams = await params;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // ─── Whitelist validation (prevents injection via status field) ──────────
    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', resolvedParams.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// Explicitly reject GET/DELETE/PUT to prevent method confusion
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
