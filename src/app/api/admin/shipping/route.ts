import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { ALGERIA_WILAYAS } from '@/lib/config/wilayas';
import { verifyAdminAuth } from '@/lib/auth/verifyAdmin';

// GET: fetch shipping settings from Supabase (fallback to hardcoded)
export async function GET() {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('shipping_rates')
      .select('*');

    if (error || !settings || settings.length === 0) {
      // Return hardcoded defaults
      return NextResponse.json({ wilayas: ALGERIA_WILAYAS.map(w => ({
        code: w.code,
        name: w.name,
        homeDelivery: w.homeDelivery,
        deskDelivery: w.deskDelivery,
      }))});
    }

    // Map Supabase docs to our format
    const wilayaMap = new Map(settings.map((s: any) => [s.wilaya, s]));
    const wilayas = ALGERIA_WILAYAS.map(w => {
      const dbData = wilayaMap.get(w.name) as any;
      return {
        code: w.code,
        name: w.name,
        homeDelivery: dbData?.home_fee ?? w.homeDelivery,
        deskDelivery: dbData?.desk_fee ?? w.deskDelivery,
      };
    });

    return NextResponse.json({ wilayas });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: save/update all shipping settings to Supabase
export async function POST(req: NextRequest) {
  try {
    // ─── Auth Guard ──────────────────────────────────────────────────────────
    const authResult = await verifyAdminAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { wilayas } = await req.json();
    if (!wilayas || !Array.isArray(wilayas)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Format for Supabase bulk upsert
    const upsertData = wilayas.map(w => ({
      wilaya: w.name,
      home_fee: w.homeDelivery,
      desk_fee: w.deskDelivery,
    }));

    const { error } = await supabaseAdmin
      .from('shipping_rates')
      .upsert(upsertData, { onConflict: 'wilaya' });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save shipping error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
