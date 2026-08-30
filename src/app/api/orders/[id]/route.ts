/**
 * /api/orders/[id] — IDOR Protection
 * GET/PUT/DELETE على طلب معين — يتطلب admin auth
 */
import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { verifyAdminAuth } from '@/lib/auth/verifyAdmin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await verifyAdminAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const safeId = String(id).replace(/[^a-zA-Z0-9-]/g, '');

  const { data, error } = await supabaseAdmin.from('orders').select('*').eq('id', safeId).single();
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ order: data });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await verifyAdminAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const safeId = String(id).replace(/[^a-zA-Z0-9-]/g, '');

  const ALLOWED_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { status } = body as Record<string, unknown>;
  if (typeof status !== 'string' || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('orders').update({ status }).eq('id', safeId);
  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return PUT(req, { params });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await verifyAdminAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const safeId = String(id).replace(/[^a-zA-Z0-9-]/g, '');

  const { error } = await supabaseAdmin.from('orders').delete().eq('id', safeId);
  if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  return NextResponse.json({ success: true });
}
