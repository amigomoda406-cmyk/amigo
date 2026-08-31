'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCartStore } from '@/contexts/cart.store';
import { useRouter } from 'next/navigation';
import { Loader2, Check, User, Phone, MapPin, Truck, ShoppingBag, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { ALGERIA_WILAYAS } from '@/lib/config/wilayas';
import { COMMUNES_BY_WILAYA } from '@/lib/config/communes';
import Image from 'next/image';

type WilayaData = { code: string; name: string; homeDelivery: number; deskDelivery: number; };

const checkoutSchema = z.object({
  fullName: z.string().min(3, 'Le nom est trop court').max(60, 'Le nom est trop long'),
  phone: z.string().regex(/^(0)(5|6|7)[0-9]{8}$/, 'Numéro invalide (ex: 0671234567)'),
  wilaya: z.string().min(1, 'Veuillez sélectionner une wilaya'),
  commune: z.string().min(2, 'La commune (البلدية) est requise'),
  address: z.string().min(5, 'L\'adresse exacte est requise'),
  deliveryType: z.enum(['home', 'desk']),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutClient() {
  const { items, totalPrice, clearCart } = useCartStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  // Fetch live delivery prices from Sanity (fallback to hardcoded)
  const [wilayasData, setWilayasData] = useState<WilayaData[]>(ALGERIA_WILAYAS);

  useEffect(() => {
    fetch('/api/admin/shipping')
      .then(r => r.json())
      .then(d => { if (d.wilayas && d.wilayas.length > 0) setWilayasData(d.wilayas); })
      .catch(() => {}); // silently fallback to hardcoded
  }, []);

  useEffect(() => {
    if (items.length === 0 && !isSubmitting) {
      router.replace('/');
    }
  }, [items, router, isSubmitting]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
    defaultValues: { deliveryType: 'home' }
  });

  const selectedWilaya = watch('wilaya');
  const deliveryType = watch('deliveryType');

  const selectedWilayaCode = wilayasData.find(w => w.name === selectedWilaya)?.code || '';
  const communesForWilaya = selectedWilayaCode ? COMMUNES_BY_WILAYA[selectedWilayaCode] || [] : [];

  useEffect(() => {
    if (selectedWilaya) {
      const wilayaData = wilayasData.find(w => w.name === selectedWilaya);
      if (wilayaData) {
        setDeliveryFee(deliveryType === 'home' ? wilayaData.homeDelivery : wilayaData.deskDelivery);
      }
    } else {
      setDeliveryFee(0);
    }
  }, [selectedWilaya, deliveryType, wilayasData]);

  const finalTotal = totalPrice + deliveryFee;

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    try {
      const wilayaCode = wilayasData.find(w => w.name === data.wilaya)?.code || '';
      const orderData = {
        customer_name: data.fullName,
        customer_phone: data.phone,
        wilaya: data.wilaya,
        wilaya_code: wilayaCode,
        commune: data.commune,
        address: data.address,
        delivery_type: data.deliveryType,
        delivery_fee: deliveryFee,
        total_amount: finalTotal,
        items: items
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error('Erreur lors de la commande');

      const { orderId } = await res.json();
      
      clearCart();
      if ('vibrate' in navigator) navigator.vibrate([20, 10, 20]);
      
      sessionStorage.setItem('lastOrder', JSON.stringify({
        ...orderData,
        orderId
      }));
      
      router.push(`/thank-you?orderId=${orderId}`);
    } catch (error) {
      toast.error('Une erreur est survenue lors de la confirmation.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <main className="min-h-[100svh] bg-[#f9fafb] py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header simple + Progress (Idea 151) */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-zinc-900">Paiement</h1>
            <p className="text-[11px] text-zinc-500 font-bold mt-1 tracking-widest uppercase">Processus sécurisé à 100%</p>
          </div>
          {/* Progress Bar */}
          <div className="flex items-center gap-3 sm:gap-5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-400">
            <span className="flex items-center gap-1.5 text-emerald-500"><div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><Check className="w-3 h-3 text-emerald-600"/></div> Panier</span>
            <span className="w-6 sm:w-10 h-[2px] bg-emerald-500 rounded-full"></span>
            <span className="flex items-center gap-1.5 text-zinc-900"><div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px]">2</div> Livraison</span>
            <span className="w-6 sm:w-10 h-[2px] bg-zinc-200 rounded-full"></span>
            <span className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-500 flex items-center justify-center text-[10px]">3</div> Paiement</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">
          
          {/* LEFT COLUMN: Form */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            
            {/* Section 1: Contact */}
            <section className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-zinc-100">
              <div className="flex items-center justify-between mb-8 border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black text-sm shadow-md">1</div>
                  <h2 className="text-lg font-black uppercase tracking-widest text-zinc-900">Contact</h2>
                </div>
                <div className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Données protégées
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-2.5">Nom Complet</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      {...register('fullName')}
                      placeholder="Ex: Amine Benali"
                      className={`w-full pl-11 pr-4 py-4 bg-zinc-50 border-2 rounded-2xl text-sm font-bold outline-none transition-all text-zinc-900 ${
                        errors.fullName ? 'border-red-500 bg-red-50/50' : 'border-transparent focus:border-black focus:bg-white'
                      }`}
                    />
                  </div>
                  {errors.fullName && <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500"/>{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-2.5">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      {...register('phone')}
                      type="tel"
                      placeholder="0671234567"
                      className={`w-full pl-11 pr-4 py-4 bg-zinc-50 border-2 rounded-2xl text-sm font-bold outline-none transition-all text-zinc-900 ${
                        errors.phone ? 'border-red-500 bg-red-50/50' : 'border-transparent focus:border-black focus:bg-white'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500"/>{errors.phone.message}</p>}
                </div>
              </div>
            </section>

            {/* Section 2: Delivery */}
            <section className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-zinc-100">
              <div className="flex items-center gap-4 mb-8 border-b border-zinc-100 pb-4">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black text-sm shadow-md">2</div>
                <h2 className="text-lg font-black uppercase tracking-widest text-zinc-900">Livraison</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-2.5">Wilaya</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <select 
                      {...register('wilaya')}
                      className={`w-full pl-11 pr-4 py-4 bg-zinc-50 border-2 rounded-2xl text-sm font-bold outline-none transition-all appearance-none text-zinc-900 cursor-pointer ${
                        errors.wilaya ? 'border-red-500 bg-red-50/50' : 'border-transparent focus:border-black focus:bg-white'
                      }`}
                    >
                      <option value="">Sélectionner une wilaya</option>
                      {wilayasData.map(w => (
                        <option key={w.code} value={w.name}>{w.code} - {w.name}</option>
                      ))}
                    </select>
                  </div>
                  {errors.wilaya && <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500"/>{errors.wilaya.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-2.5">البلدية (Commune)</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <select 
                      {...register('commune')}
                      disabled={!selectedWilaya}
                      className={`w-full pl-11 pr-4 py-4 bg-zinc-50 border-2 rounded-2xl text-sm font-bold outline-none transition-all appearance-none text-zinc-900 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        errors.commune ? 'border-red-500 bg-red-50/50' : 'border-transparent focus:border-black focus:bg-white'
                      }`}
                    >
                      <option value="">Sélectionner une commune</option>
                      {communesForWilaya.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  {errors.commune && <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500"/>{errors.commune.message}</p>}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-2.5">العنوان بالتفصيل (Adresse Exacte)</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    {...register('address')}
                    placeholder="Ex: Cité 200 logts, Bâtiment A..."
                    className={`w-full pl-11 pr-4 py-4 bg-zinc-50 border-2 rounded-2xl text-sm font-bold outline-none transition-all text-zinc-900 ${
                      errors.address ? 'border-red-500 bg-red-50/50' : 'border-transparent focus:border-black focus:bg-white'
                    }`}
                  />
                </div>
                {errors.address && <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500"/>{errors.address.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-3">Mode de Livraison</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                    deliveryType === 'home' ? 'border-black bg-zinc-50 shadow-md' : 'border-zinc-100 bg-white hover:border-zinc-300'
                  }`}>
                    <input type="radio" value="home" {...register('deliveryType')} className="sr-only" />
                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center transition-colors ${deliveryType === 'home' ? 'border-black' : 'border-zinc-300'}`}>
                      {deliveryType === 'home' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex justify-between items-start w-full">
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-900">À Domicile</span>
                        <span className="text-sm font-black text-[#C9A96E]">
                          {selectedWilaya ? `${wilayasData.find(w => w.name === selectedWilaya)?.homeDelivery} DA` : '-'}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-zinc-500 mt-1">Livraison jusqu'à votre porte.</span>
                      {/* Expected Delivery Date (Idea 155) */}
                      {selectedWilaya && <span className="text-[9px] font-bold text-emerald-600 mt-2 bg-emerald-50 w-fit px-2 py-0.5 rounded-md">Livraison estimée : 24-48h</span>}
                    </div>
                  </label>

                  <label className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                    deliveryType === 'desk' ? 'border-black bg-zinc-50 shadow-md' : 'border-zinc-100 bg-white hover:border-zinc-300'
                  }`}>
                    <input type="radio" value="desk" {...register('deliveryType')} className="sr-only" />
                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center transition-colors ${deliveryType === 'desk' ? 'border-black' : 'border-zinc-300'}`}>
                      {deliveryType === 'desk' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex justify-between items-start w-full">
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-900">Bureau</span>
                        <span className="text-sm font-black text-[#C9A96E]">
                          {selectedWilaya ? `${wilayasData.find(w => w.name === selectedWilaya)?.deskDelivery} DA` : '-'}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-zinc-500 mt-1">Point de retrait relais.</span>
                      {selectedWilaya && <span className="text-[9px] font-bold text-emerald-600 mt-2 bg-emerald-50 w-fit px-2 py-0.5 rounded-md">Livraison estimée : 24-48h</span>}
                    </div>
                  </label>
                </div>
              </div>
            </section>

            {/* Section 3: Paiement */}
            <section className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-zinc-100 mb-8 lg:mb-0">
              <div className="flex items-center gap-4 mb-8 border-b border-zinc-100 pb-4">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black text-sm shadow-md">3</div>
                <h2 className="text-lg font-black uppercase tracking-widest text-zinc-900">Paiement</h2>
              </div>
              
              {/* Payment Methods Visuals (Idea 158) */}
              <div className="space-y-4">
                <label className="relative p-5 rounded-2xl border-2 border-black bg-zinc-50 cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-black" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Paiement à la livraison</h3>
                      <p className="text-[10px] font-bold text-zinc-500 mt-0.5">Payez en espèces à la réception de votre colis.</p>
                    </div>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                </label>

                <label className="relative p-5 rounded-2xl border-2 border-zinc-100 bg-white cursor-not-allowed flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full border-2 border-zinc-300 flex items-center justify-center">
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Carte Bancaire / CIB</h3>
                      <p className="text-[10px] font-bold text-zinc-500 mt-0.5">Bientôt disponible.</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0 grayscale">
                    <div className="w-8 h-5 bg-zinc-200 rounded text-[6px] font-bold flex items-center justify-center">CIB</div>
                    <div className="w-8 h-5 bg-zinc-200 rounded text-[6px] font-bold flex items-center justify-center">EDAHABIA</div>
                  </div>
                </label>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: Order Summary (Sticky) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 mt-8 lg:mt-0">
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-black/5 border border-zinc-100">
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6 border-b border-zinc-100 pb-4">Récapitulatif</h2>
              
              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-zinc-100 rounded-xl overflow-hidden shrink-0 relative border border-zinc-200">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                      <div className="absolute top-0 right-0 w-5 h-5 bg-black text-white text-[10px] font-bold flex items-center justify-center rounded-bl-xl">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center py-1">
                      <h4 className="text-[11px] font-black uppercase tracking-tight text-zinc-900 line-clamp-2 leading-tight">{item.title}</h4>
                      <div className="text-[9px] font-bold text-zinc-500 mt-1 flex gap-2 uppercase tracking-widest">
                        {(item.selectedColor || item.selectedSize) && (
                          <span>{item.selectedColor} {item.selectedSize ? `| ${item.selectedSize}` : ''}</span>
                        )}
                      </div>
                      <span className="text-xs font-black text-[#C9A96E] mt-auto">{(item.price || 0).toLocaleString('fr-DZ')} DA</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Section (Idea 154) */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input type="text" placeholder="Code Promo" className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-black transition-colors" />
                  <button type="button" className="bg-black text-white px-5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C9A96E] transition-colors">Appliquer</button>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-zinc-100 pt-6 space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Sous-total</span>
                  <span className="font-black text-zinc-900">{totalPrice.toLocaleString('fr-DZ')} DA</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Livraison</span>
                  <span className="font-black text-emerald-600">
                    {selectedWilaya ? `+${deliveryFee.toLocaleString('fr-DZ')} DA` : 'À calculer'}
                  </span>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-zinc-200 pt-6 mb-8 flex justify-between items-end">
                <span className="text-sm font-black uppercase tracking-widest text-zinc-900">Total à payer</span>
                <span className="text-3xl font-black text-black leading-none">{finalTotal.toLocaleString('fr-DZ')} DA</span>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white py-5 rounded-2xl text-[11px] font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-[#C9A96E] transition-all shadow-xl shadow-black/20 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Traitement en cours...</>
                  ) : (
                    <><Check className="w-5 h-5" /> Confirmer la commande</>
                  )}
                </span>
              </button>
              
              {/* Ultimate Trust Badges (Idea 156) */}
              <div className="mt-6 flex items-center justify-center gap-4 text-zinc-400">
                <div className="flex items-center gap-1.5" title="Chiffrement SSL 256-bit">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <span className="text-[8px] font-bold uppercase tracking-widest">Paiement Sécurisé SSL</span>
                </div>
                <div className="flex items-center gap-1.5" title="Paiement à la livraison">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  <span className="text-[8px] font-bold uppercase tracking-widest">Paiement à la livraison</span>
                </div>
              </div>

            </div>
          </div>

        </form>
      </div>
    </main>
  );
}
