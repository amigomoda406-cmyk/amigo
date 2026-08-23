import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Package, Clock, CheckCircle, Truck, XCircle, FileText, Settings, LogOut, ChevronLeft } from 'lucide-react';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) redirect('/xk9m2p4t8r6w1qzjvn3f7/login');
  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_PASSWORD || 'UNSET_SECRET');
    await jwtVerify(token, secret);
  } catch {
    redirect('/xk9m2p4t8r6w1qzjvn3f7/login');
  }
}

async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return data;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-600 border-blue-200',
  shipped: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  shipped: 'Expédié',
  delivered: 'Livré',
  cancelled: 'Annulé',
};

export default async function AdminOrders() {
  await verifyAdmin();
  const orders = await getOrders();

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-zinc-600" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-widest uppercase text-zinc-900">Commandes</h1>
            <p className="text-xs text-zinc-500 font-medium">Gestion des commandes clients</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Package className="w-16 h-16 text-zinc-200 mb-4" strokeWidth={1} />
              <h2 className="text-lg font-black uppercase text-zinc-900 tracking-widest">Aucune commande</h2>
              <p className="text-sm text-zinc-500 mt-2">Les commandes apparaîtront ici.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-100">
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">ID / Date</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Client</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Statut</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Montant</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-black text-zinc-900 uppercase">#{order.id.slice(0, 8)}</span>
                          <span className="text-[10px] font-bold text-zinc-400">
                            {new Date(order.created_at).toLocaleDateString('fr-DZ', { 
                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-zinc-900">{order.customer_name}</span>
                          <span className="text-[10px] text-zinc-500">{order.customer_wilaya}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[order.status] || statusColors.pending}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-black text-zinc-900">{order.total.toLocaleString()} DA</span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center justify-center px-4 py-2 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C9A96E] transition-colors"
                        >
                          Détails
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
