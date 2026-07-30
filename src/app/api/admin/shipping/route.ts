import { NextResponse, NextRequest } from 'next/server';
import { client } from '@/lib/sanity/client';
import { ALGERIA_WILAYAS } from '@/lib/config/wilayas';

// GET: fetch shipping settings from Sanity (or fallback to hardcoded)
export async function GET() {
  try {
    const settings = await client.fetch(
      `*[_type == "shippingSettings"] { wilaya, homeDeliveryPrice, deskDeliveryPrice, "id": _id }`
    );

    if (!settings || settings.length === 0) {
      // Return hardcoded defaults
      return NextResponse.json({ wilayas: ALGERIA_WILAYAS.map(w => ({
        code: w.code,
        name: w.name,
        homeDelivery: w.homeDelivery,
        deskDelivery: w.deskDelivery,
      }))});
    }

    // Map Sanity docs to our format
    const wilayaMap = new Map(settings.map((s: any) => [s.wilaya, s]));
    const wilayas = ALGERIA_WILAYAS.map(w => {
      const sanityData = wilayaMap.get(w.name) as any;
      return {
        code: w.code,
        name: w.name,
        homeDelivery: sanityData?.homeDeliveryPrice ?? w.homeDelivery,
        deskDelivery: sanityData?.deskDeliveryPrice ?? w.deskDelivery,
      };
    });

    return NextResponse.json({ wilayas });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: save/update all shipping settings to Sanity
export async function POST(req: NextRequest) {
  try {
    const { wilayas } = await req.json();
    if (!wilayas || !Array.isArray(wilayas)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const sanityClient = client.withConfig({ token: process.env.SANITY_API_TOKEN });

    // Get existing docs
    const existing = await sanityClient.fetch(
      `*[_type == "shippingSettings"] { "id": _id, wilaya }`
    );
    const existingMap = new Map(existing.map((e: any) => [e.wilaya, e.id]));

    const transaction = sanityClient.transaction();

    for (const w of wilayas) {
      const docId = existingMap.get(w.name);
      if (docId) {
        // Update existing
        transaction.patch(docId, {
          set: {
            homeDeliveryPrice: w.homeDelivery,
            deskDeliveryPrice: w.deskDelivery,
          }
        });
      } else {
        // Create new
        transaction.create({
          _type: 'shippingSettings',
          wilaya: w.name,
          homeDeliveryPrice: w.homeDelivery,
          deskDeliveryPrice: w.deskDelivery,
        });
      }
    }

    await transaction.commit();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save shipping error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
