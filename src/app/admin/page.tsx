import { getAllOrders } from '@/lib/supabase/orders';
import OrdersTable from '@/components/admin/OrdersTable';

// Revalidate every 0 seconds to ensure fresh data
export const revalidate = 0;

export default async function AdminDashboard() {
  const { orders } = await getAllOrders();
  
  // Basic stats calculation
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_amount : 0), 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-2 relative overflow-hidden">
          <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Total Commandes</span>
          <span className="text-3xl font-black text-zinc-900">{totalOrders}</span>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50" />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-2 relative overflow-hidden">
          <span className="text-xs font-black uppercase tracking-widest text-zinc-400">En Attente</span>
          <span className="text-3xl font-black text-orange-500">{pendingOrders}</span>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full opacity-50" />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-2 relative overflow-hidden">
          <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Livrés</span>
          <span className="text-3xl font-black text-emerald-500">{deliveredOrders}</span>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50" />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-2 relative overflow-hidden">
          <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Revenus</span>
          <span className="text-2xl font-black text-zinc-900">{totalRevenue.toLocaleString('fr-DZ')} DA</span>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full opacity-50" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="p-6 border-b border-zinc-100">
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900">Dernières Commandes</h2>
        </div>
        <OrdersTable initialOrders={orders} />
      </div>
    </div>
  );
}
