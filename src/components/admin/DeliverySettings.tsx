'use client';
import { useState } from 'react';
import { ALGERIA_WILAYAS } from '@/lib/config/wilayas';
import { Save, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DeliverySettings() {
  const [wilayas, setWilayas] = useState(ALGERIA_WILAYAS);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handlePriceChange = (code: string, type: 'home' | 'desk', value: number) => {
    setWilayas(prev => prev.map(w => 
      w.code === code ? { ...w, [type === 'home' ? 'homeDelivery' : 'deskDelivery']: value } : w
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // In a real app, this would send an API request to Supabase or Sanity to save settings
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Paramètres de livraison mis à jour avec succès');
    }, 1000);
  };

  const filteredWilayas = wilayas.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.code.includes(searchTerm)
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
      <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900">Tarifs de Livraison</h2>
          <p className="text-xs text-zinc-500 font-bold mt-1">Gérez les prix de livraison pour les 58 wilayas</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Rechercher une wilaya..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold focus:outline-none focus:border-zinc-900 transition-colors"
            />
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Enregistrer
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-100">Code</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-100">Wilaya</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-100">À Domicile (DA)</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-100">Bureau Yalidine (DA)</th>
            </tr>
          </thead>
          <tbody>
            {filteredWilayas.map((wilaya) => (
              <tr key={wilaya.code} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-3 border-b border-zinc-100">
                  <span className="text-xs font-black text-zinc-900 bg-zinc-100 px-2 py-1 rounded">{wilaya.code}</span>
                </td>
                <td className="px-6 py-3 border-b border-zinc-100 text-sm font-bold text-zinc-900">
                  {wilaya.name}
                </td>
                <td className="px-6 py-3 border-b border-zinc-100">
                  <input 
                    type="number"
                    value={wilaya.homeDelivery}
                    onChange={(e) => handlePriceChange(wilaya.code, 'home', parseInt(e.target.value) || 0)}
                    className="w-24 px-3 py-1.5 bg-white border border-zinc-200 rounded text-sm font-bold focus:outline-none focus:border-zinc-900"
                  />
                </td>
                <td className="px-6 py-3 border-b border-zinc-100">
                  <input 
                    type="number"
                    value={wilaya.deskDelivery}
                    onChange={(e) => handlePriceChange(wilaya.code, 'desk', parseInt(e.target.value) || 0)}
                    className="w-24 px-3 py-1.5 bg-white border border-zinc-200 rounded text-sm font-bold focus:outline-none focus:border-zinc-900"
                  />
                </td>
              </tr>
            ))}
            {filteredWilayas.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm font-bold text-zinc-500">
                  Aucune wilaya trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
