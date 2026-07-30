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
import Image from 'next/image';

type WilayaData = { code: string; name: string; homeDelivery: number; deskDelivery: number; };

const checkoutSchema = z.object({
  fullName: z.string().min(3, 'Le nom est trop court').max(60, 'Le nom est trop long'),
  phone: z.string().regex(/^(0)(5|6|7)[0-9]{8}$/, 'Numéro invalide (ex: 0671234567)'),
  wilaya: z.string().min(1, 'Veuillez sélectionner une wilaya'),
  commune: z.string().min(2, 'La commune est requise'),
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
      const orderData = {
        customer_name: data.fullName,
        customer_phone: data.phone,
        wilaya: data.wilaya,
        commune: data.commune,
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
        
        {/* Header simple */}
        <div className="mb-8 text-center lg:text-left">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-zinc-900">Finaliser la Commande</h1>
          <p className="text-sm text-zinc-500 font-medium mt-2">Veuillez remplir vos informations pour confirmer l'achat.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">
          
          {/* LEFT COLUMN: Form */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            
            {/* Section 1: Contact */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
              <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-4">
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">1</div>
                <h2 className="text-lg font-black uppercase tracking-widest text-zinc-900">Contact</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Nom Complet</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      {...register('fullName')}
                      placeholder="Ex: Amine Benali"
                      className={`w-full pl-11 pr-4 py-3.5 bg-zinc-50 border-2 rounded-xl text-sm font-bold outline-none transition-all text-zinc-900 ${
                        errors.fullName ? 'border-red-500 bg-red-50/50' : 'border-zinc-200 focus:border-zinc-900 focus:bg-white'
                      }`}
                    />
                  </div>
                  {errors.fullName && <p className="text-[10px] text-red-500 font-bold mt-1.5">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Numéro de Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      {...register('phone')}
                      type="tel"
                      placeholder="0671234567"
                      className={`w-full pl-11 pr-4 py-3.5 bg-zinc-50 border-2 rounded-xl text-sm font-bold outline-none transition-all text-zinc-900 ${
                        errors.phone ? 'border-red-500 bg-red-50/50' : 'border-zinc-200 focus:border-zinc-900 focus:bg-white'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1.5">{errors.phone.message}</p>}
                </div>
              </div>
            </section>

            {/* Section 2: Delivery */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
              <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-4">
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">2</div>
                <h2 className="text-lg font-black uppercase tracking-widest text-zinc-900">Livraison</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Wilaya</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <select 
                      {...register('wilaya')}
                      className={`w-full pl-11 pr-4 py-3.5 bg-zinc-50 border-2 rounded-xl text-sm font-bold outline-none transition-all appearance-none text-zinc-900 ${
                        errors.wilaya ? 'border-red-500 bg-red-50/50' : 'border-zinc-200 focus:border-zinc-900 focus:bg-white'
                      }`}
                    >
                      <option value="">Sélectionner une wilaya</option>
                      {wilayasData.map(w => (
                        <option key={w.code} value={w.name}>{w.code} - {w.name}</option>
                      ))}
                    </select>
                  </div>
                  {errors.wilaya && <p className="text-[10px] text-red-500 font-bold mt-1.5">{errors.wilaya.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Commune / Adresse exacte</label>
                  <input 
                    {...register('commune')}
                    placeholder="Ex: Rouiba, Cité 200..."
                    className={`w-full px-4 py-3.5 bg-zinc-50 border-2 rounded-xl text-sm font-bold outline-none transition-all text-zinc-900 ${
                      errors.commune ? 'border-red-500 bg-red-50/50' : 'border-zinc-200 focus:border-zinc-900 focus:bg-white'
                    }`}
                  />
                  {errors.commune && <p className="text-[10px] text-red-500 font-bold mt-1.5">{errors.commune.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Type de Livraison</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    deliveryType === 'home' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}>
                    <input type="radio" value="home" {...register('deliveryType')} className="sr-only" />
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${deliveryType === 'home' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                        <Truck className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-900">À Domicile</span>
                        <span className="text-[9px] font-bold text-zinc-500">Jusqu'à votre porte</span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-zinc-900">
                      {selectedWilaya ? `${wilayasData.find(w => w.name === selectedWilaya)?.homeDelivery} DA` : '-'}
                    </span>
                  </label>

                  <label className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    deliveryType === 'desk' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}>
                    <input type="radio" value="desk" {...register('deliveryType')} className="sr-only" />
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${deliveryType === 'desk' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-900">Bureau</span>
                        <span className="text-[9px] font-bold text-zinc-500">Point de retrait</span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-zinc-900">
                      {selectedWilaya ? `${wilayasData.find(w => w.name === selectedWilaya)?.deskDelivery} DA` : '-'}
                    </span>
                  </label>
                </div>
              </div>
            </section>

            {/* Section 3: Paiement */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 mb-8 lg:mb-0">
              <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-4">
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">3</div>
                <h2 className="text-lg font-black uppercase tracking-widest text-zinc-900">Paiement</h2>
              </div>
              <div className="p-4 bg-emerald-50 border-2 border-emerald-100 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-full shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-900">Paiement à la livraison</h3>
                  <p className="text-[10px] font-bold text-emerald-700">Vous ne payez qu'après avoir reçu votre commande.</p>
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: Order Summary (Sticky) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 mt-8 lg:mt-0">
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-zinc-200/20 border border-zinc-100">
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6 border-b border-zinc-100 pb-4">Récapitulatif</h2>
              
              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-zinc-100 rounded-xl overflow-hidden shrink-0 relative">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-xs font-black text-zinc-900 line-clamp-1">{item.title}</h4>
                      <div className="text-[10px] font-bold text-zinc-500 mt-1 flex gap-2">
                        <span>Qté: {item.quantity}</span>
                        {(item.selectedColor || item.selectedSize) && (
                          <span>| {item.selectedColor} {item.selectedSize}</span>
                        )}
                      </div>
                      <span className="text-xs font-black text-zinc-900 mt-1">{(item.price || 0).toLocaleString('fr-DZ')} DA</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-zinc-100 pt-4 space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 font-bold">Sous-total</span>
                  <span className="font-black text-zinc-900">{totalPrice.toLocaleString('fr-DZ')} DA</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 font-bold">Livraison</span>
                  <span className="font-black text-blue-600">
                    {selectedWilaya ? `+${deliveryFee.toLocaleString('fr-DZ')} DA` : '---'}
                  </span>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-zinc-200 pt-4 mb-8 flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-900">Total</span>
                <span className="text-3xl font-black text-zinc-900">{finalTotal.toLocaleString('fr-DZ')} DA</span>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-zinc-900 text-white py-4 rounded-xl text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Traitement en cours...</>
                  ) : (
                    <><Check className="w-4 h-4" /> Confirmer la commande</>
                  )}
                </span>
              </button>

            </div>
          </div>

        </form>
      </div>
    </main>
  );
}
