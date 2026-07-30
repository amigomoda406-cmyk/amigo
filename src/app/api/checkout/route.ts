import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { sendTelegramNotification } from '@/lib/telegram';
import { client } from '@/lib/sanity/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer_name, customer_phone, wilaya, commune, total_amount, items } = body;

    if (!customer_name || !customer_phone || !wilaya || !commune || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderNumber = `AMIGO-${Date.now().toString().slice(-6)}`;

    // 1. Insert Order into Sanity
    const sanityOrder = {
      _type: 'order',
      orderNumber,
      customerName: customer_name,
      customerPhone: customer_phone,
      wilaya,
      commune,
      totalAmount: total_amount,
      status: 'pending',
      items: items.map((item: any) => ({
        _key: crypto.randomUUID(),
        productName: item.title,
        quantity: item.quantity,
        price: item.price,
        selectedSize: item.selectedSize || '',
        selectedColor: item.selectedColor || '',
        productRef: item.productId ? {
          _type: 'reference',
          _ref: item.productId
        } : undefined
      }))
    };

    const sanityClientWithToken = client.withConfig({ token: process.env.SANITY_API_TOKEN });
    const createdSanityOrder = await sanityClientWithToken.create(sanityOrder);

    // 2. Insert Order into Supabase (Backup)
    let supabaseOrderId = null;
    try {
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert([
          {
            customer_name,
            customer_phone,
            wilaya,
            commune,
            total_amount,
          }
        ])
        .select()
        .single();

      if (!orderError && order) {
        supabaseOrderId = order.id;
        const orderItems = items.map((item: any) => ({
          order_id: order.id,
          product_id: item.productId,
          product_name: item.title,
          price: item.price,
          quantity: item.quantity,
          selected_size: item.selectedSize || null,
          selected_color: item.selectedColor || null,
        }));
        await supabaseAdmin.from('order_items').insert(orderItems);
      }
    } catch (e) {
      console.warn("Supabase backup failed, but Sanity succeeded.");
    }

    // 3. Send Telegram Notification
    const itemsListText = items.map((i: any) => 
      `- ${i.quantity}x ${i.title} (${i.price} DA) ${i.selectedSize ? `[Taille: ${i.selectedSize}]` : ''}`
    ).join('\n');

    const tgMessage = `
🛒 <b>Nouvelle Commande ! (${orderNumber})</b>

👤 <b>Client:</b> ${customer_name}
📞 <b>Téléphone:</b> ${customer_phone}
📍 <b>Adresse:</b> ${wilaya} - ${commune}
💰 <b>Total:</b> ${total_amount} DA

📦 <b>Produits:</b>
${itemsListText}

#Nouvelle_Commande
    `;

    await sendTelegramNotification(tgMessage);

    return NextResponse.json({ success: true, orderId: createdSanityOrder._id });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ success: false, error: 'Checkout failed' }, { status: 500 });
  }
}
