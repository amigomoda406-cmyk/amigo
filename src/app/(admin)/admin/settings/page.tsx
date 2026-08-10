'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Save, Truck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

type WilayaData = { code: string; name: string; homeDelivery: number; deskDelivery: number; };

export default function ShippingSettings() {
  const [wilayas, setWilayas] = useState<WilayaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/shipping')
      .then(r => r.json())
      .then(d => {
        if (d.wilayas) setWilayas(d.wilayas);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleUpdate = (code: string, field: 'homeDelivery' | 'deskDelivery', value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;
    setWilayas(prev => prev.map(w => w.code === code ? { ...w, [field]: numValue } : w));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wilayas }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Tarifs de livraison mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-zinc-600" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-widest uppercase text-zinc-900">Tarifs de Livraison</h1>
            <p className="text-xs text-zinc-500 font-medium">Gestion des frais d'expédition</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#C9A96E] transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Wilaya</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Livraison à domicile (DA)</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Livraison au bureau (DA)</th>
                </tr>
              </thead>
              <tbody>
                {wilayas.map((wilaya) => (
                  <tr key={wilaya.code} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-zinc-400">{wilaya.code}</span>
                        <span className="text-sm font-bold text-zinc-900">{wilaya.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="relative flex items-center">
                        <Truck className="absolute left-3 w-4 h-4 text-zinc-400" />
                        <input
                          type="number"
                          value={wilaya.homeDelivery}
                          onChange={(e) => handleUpdate(wilaya.code, 'homeDelivery', e.target.value)}
                          className="w-32 pl-9 pr-4 py-2 bg-zinc-50 border-2 border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-zinc-900 transition-all"
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="relative flex items-center">
                        <Truck className="absolute left-3 w-4 h-4 text-zinc-400" />
                        <input
                          type="number"
                          value={wilaya.deskDelivery}
                          onChange={(e) => handleUpdate(wilaya.code, 'deskDelivery', e.target.value)}
                          className="w-32 pl-9 pr-4 py-2 bg-zinc-50 border-2 border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-zinc-900 transition-all"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
