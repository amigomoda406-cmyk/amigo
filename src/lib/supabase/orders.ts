import { supabaseAdmin } from './client';

export async function getAllOrders() {
  const { data, error, count } = await supabaseAdmin
    .from('orders')
    .select('*, items:order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (error) {
    return { orders: [], count: 0 };
  }

  return { orders: data || [], count: count || 0 };
}
