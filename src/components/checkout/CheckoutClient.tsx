'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCartStore } from '@/contexts/cart.store';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Check, User, Phone, MapPin, Truck, ArrowRight, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { ALGERIA_WILAYAS } from '@/lib/config/wilayas';

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
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (items.length === 0 && !isSubmitting) {
      router.replace('/');
    }
  }, [items, router, isSubmitting]);

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
    defaultValues: { deliveryType: 'home' }
  });

  const selectedWilaya = watch('wilaya');
  const deliveryType = watch('deliveryType');
  const watchAll = watch();

  useEffect(() => {
    if (selectedWilaya) {
      const wilayaData = ALGERIA_WILAYAS.find(w => w.name === selectedWilaya);
      if (wilayaData) {
        setDeliveryFee(deliveryType === 'home' ? wilayaData.homeDelivery : wilayaData.deskDelivery);
      }
    } else {
      setDeliveryFee(0);
    }
  }, [selectedWilaya, deliveryType]);

  const finalTotal = totalPrice + deliveryFee;

  const handleNextStep = async () => {
    if (step === 1) {
      const valid = await trigger(['fullName', 'phone']);
      if (valid) setStep(2);
    } else if (step === 2) {
      const valid = await trigger(['wilaya', 'commune', 'deliveryType']);
      if (valid) setStep(3);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (step < 3) {
      handleNextStep();
      return;
    }

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
      router.push(`/thank-you?orderId=${orderId}`);
    } catch (error) {
      toast.error('Une erreur est survenue');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <main className="min-h-[100svh] bg-[#0a0a0f] flex flex-col md:max-w-[800px] md:mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/10">
        <button 
          onClick={() => step > 1 ? setStep((prev) => (prev - 1) as 1 | 2) : router.back()} 
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h1 className="text-[11px] font-black tracking-widest uppercase text-white">Passer Commande</h1>
        <div className="w-9 h-9" />
      </header>

      {/* Stepper Indicator */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-4 h-0.5 bg-white/10" />
          <div
            className="absolute left-0 top-4 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          />

          {[{n:1,label:'Contact'},{n:2,label:'Livraison'},{n:3,label:'Paiement'}].map(({n,label}) => (
            <div key={n} className="flex flex-col items-center gap-2 z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black transition-all border-2 ${
                step > n
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : step === n
                    ? 'bg-transparent border-purple-500 text-purple-400'
                    : 'bg-transparent border-white/20 text-white/30'
              }`}>
                {step > n ? <Check className="w-3.5 h-3.5" /> : n}
              </div>
              <span className={`text-[8px] font-bold uppercase tracking-widest ${
                step >= n ? 'text-purple-400' : 'text-white/30'
              }`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 pb-32">
        <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col gap-6">
          
          {/* STEP 1: CONTACT */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">Vos Informations</h2>
              <p className="text-xs text-white/40 font-medium mb-6">Étape 1 sur 3 — Données personnelles</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Nom Complet</label>
                  <input 
                    {...register('fullName')}
                    placeholder="Ex: Amine Benali"
                    className={`w-full px-4 py-4 bg-white/8 border rounded-xl text-sm font-bold outline-none transition-all text-white placeholder-white/20 ${
                      errors.fullName ? 'border-red-500/70' : 'border-white/15 focus:border-purple-500'
                    }`}
                  />
                  {errors.fullName && <p className="text-[10px] text-red-400 font-bold mt-1.5">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Numéro de Téléphone</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-white/60">0</span>
                    <input 
                      {...register('phone')}
                      type="tel"
                      placeholder="671234567"
                      className={`w-full pl-8 pr-4 py-4 bg-white/8 border rounded-xl text-sm font-bold outline-none transition-all text-white placeholder-white/20 ${
                        errors.phone ? 'border-red-500/70' : 'border-white/15 focus:border-purple-500'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-red-400 font-bold mt-1.5">{errors.phone.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DELIVERY */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">Adresse de Livraison</h2>
              <p className="text-xs text-white/40 font-medium mb-6">Étape 2 sur 3 — Informations de livraison</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Wilaya</label>
                  <select 
                    {...register('wilaya')}
                    className={`w-full px-4 py-4 bg-white/8 border rounded-xl text-sm font-bold outline-none transition-all appearance-none text-white ${
                      errors.wilaya ? 'border-red-500/70' : 'border-white/15 focus:border-purple-500'
                    }`}
                  >
                    <option value="" className="bg-zinc-900">Sélectionner une wilaya</option>
                    {ALGERIA_WILAYAS.map(w => (
                      <option key={w.code} value={w.name} className="bg-zinc-900">{w.code} - {w.name}</option>
                    ))}
                  </select>
                  {errors.wilaya && <p className="text-[10px] text-red-400 font-bold mt-1.5">{errors.wilaya.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Commune / Adresse exacte</label>
                  <input 
                    {...register('commune')}
                    placeholder="Ex: Rouiba, Cité 200..."
                    className={`w-full px-4 py-4 bg-white/8 border rounded-xl text-sm font-bold outline-none transition-all text-white placeholder-white/20 ${
                      errors.commune ? 'border-red-500/70' : 'border-white/15 focus:border-purple-500'
                    }`}
                  />
                  {errors.commune && <p className="text-[10px] text-red-400 font-bold mt-1.5">{errors.commune.message}</p>}
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">Type de Livraison</label>
                  <div className="flex flex-col gap-3">
                    <label className={`relative p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      deliveryType === 'home' ? 'border-purple-500 bg-purple-500/10' : 'border-white/15 bg-white/5 hover:border-white/30'
                    }`}>
                      <input type="radio" value="home" {...register('deliveryType')} className="sr-only" />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-widest text-white">À Domicile</span>
                          <span className="text-[10px] font-bold text-white/40">Livraison jusqu'à votre porte</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-blue-400">
                        {selectedWilaya ? `${ALGERIA_WILAYAS.find(w => w.name === selectedWilaya)?.homeDelivery} DA` : '-'}
                      </span>
                    </label>

                    <label className={`relative p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      deliveryType === 'desk' ? 'border-amber-500 bg-amber-500/10' : 'border-white/15 bg-white/5 hover:border-white/30'
                    }`}>
                      <input type="radio" value="desk" {...register('deliveryType')} className="sr-only" />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-widest text-white">Bureau (Yalidine)</span>
                          <span className="text-[10px] font-bold text-white/40">Récupération au bureau</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-amber-400">
                        {selectedWilaya ? `${ALGERIA_WILAYAS.find(w => w.name === selectedWilaya)?.deskDelivery} DA` : '-'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">Récapitulatif</h2>
              <p className="text-xs text-white/40 font-medium mb-6">Étape 3 sur 3 — Confirmez votre commande</p>
              
              {/* Order Summary Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Mode de Paiement</span>
                  <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-400/20">
                    <Check className="w-3 h-3" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">À la livraison</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/50 font-bold">Sous-total ({items.length} articles)</span>
                    <span className="text-sm font-black text-white">{totalPrice.toLocaleString('fr-DZ')} DA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/50 font-bold">Frais de livraison</span>
                    <span className="text-sm font-black text-blue-400">+{deliveryFee.toLocaleString('fr-DZ')} DA</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-dashed border-white/15 flex justify-between items-end">
                  <span className="text-xs font-black uppercase tracking-widest text-white/60">Total à Payer</span>
                  <span className="text-2xl font-black text-white">{finalTotal.toLocaleString('fr-DZ')} DA</span>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-3">Vos Informations</h3>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <p className="text-xs text-white font-bold">{watchAll.fullName}</p>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <p className="text-xs text-white font-bold">{watchAll.phone}</p>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <p className="text-xs text-white font-bold">{watchAll.commune}, {watchAll.wilaya}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Modifier les informations →
                </button>
              </div>
            </div>
          )}

          {/* Sticky CTA */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0f]/95 backdrop-blur-md border-t border-white/10 z-50 md:max-w-[800px] md:mx-auto">
            {step < 3 ? (
              <button 
                type="button"
                onClick={handleNextStep}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl text-[11px] font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-2xl shadow-purple-900/30"
              >
                Continuer <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white py-4 rounded-xl text-[11px] font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-2xl shadow-emerald-900/30 disabled:opacity-50"
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</> : <><ShoppingBag className="w-4 h-4" /> Confirmer la Commande</>}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
