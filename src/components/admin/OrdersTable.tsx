'use client';
import { useState } from 'react';
import { Phone, Eye, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  confirmed: { label: 'Confirmé', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  processing: { label: 'En cours', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
  shipped: { label: 'Expédié', color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-100' },
  delivered: { label: 'Livré ✓', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  cancelled: { label: 'Annulé', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
  returned: { label: 'Retourné', color: 'text-zinc-500', bg: 'bg-zinc-50', border: 'border-zinc-100' },
};

export default function OrdersTable({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) throw new Error();
      toast.success('Statut mis à jour !');
      router.refresh();
    } catch (e) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-zinc-50 text-[10px] font-black uppercase tracking-widest text-zinc-400">
            <th className="p-4 border-b border-zinc-100 font-medium">Commande</th>
            <th className="p-4 border-b border-zinc-100 font-medium">Client</th>
            <th className="p-4 border-b border-zinc-100 font-medium">Lieu</th>
            <th className="p-4 border-b border-zinc-100 font-medium">Total</th>
            <th className="p-4 border-b border-zinc-100 font-medium">Statut</th>
            <th className="p-4 border-b border-zinc-100 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {initialOrders.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-zinc-500 font-medium">
                Aucune commande pour le moment
              </td>
            </tr>
          ) : initialOrders.map((order) => {
            const statusStyle = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
            
            return (
              <tr key={order.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors group">
                <td className="p-4">
                  <span className="font-mono font-bold text-zinc-900">#{order.id.slice(-6).toUpperCase()}</span>
                  <span className="block text-xs text-zinc-400 mt-1">{new Date(order.created_at).toLocaleDateString('fr-DZ')}</span>
                </td>
                <td className="p-4">
                  <span className="font-bold text-zinc-900 block">{order.customer_name}</span>
                  <span className="text-xs text-zinc-500">{order.customer_phone}</span>
                </td>
                <td className="p-4">
                  <span className="font-bold text-zinc-700 block">{order.wilaya}</span>
                  <span className="text-xs text-zinc-400 uppercase tracking-wider">{order.delivery_type === 'home' ? 'Domicile' : 'Bureau'}</span>
                </td>
                <td className="p-4">
                  <span className="font-black text-zinc-900">{order.total_amount.toLocaleString('fr-DZ')} DA</span>
                </td>
                <td className="p-4">
                  <select
                    disabled={updatingId === order.id}
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border appearance-none cursor-pointer outline-none transition-all ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}
                  >
                    {Object.entries(STATUS_CONFIG).map(([val, conf]) => (
                      <option key={val} value={val}>{conf.label}</option>
                    ))}
                  </select>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-8 h-8 flex items-center justify-center rounded bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <a href={`tel:${order.customer_phone}`} className="w-8 h-8 flex items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                      <Phone className="w-4 h-4" />
                    </a>
                    <a href={`https://wa.me/213${order.customer_phone.replace(/^0/, '')}`} target="_blank" className="w-8 h-8 flex items-center justify-center rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
