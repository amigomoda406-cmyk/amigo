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
    <main className="min-h-[100svh] bg-zinc-50 flex flex-col max-w-[1200px] mx-auto">

      {/* Stepper Indicator */}
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-center justify-between relative max-w-sm mx-auto">
          <div className="absolute left-0 right-0 top-4 h-0.5 bg-zinc-200" />
          <div
            className="absolute left-0 top-4 h-0.5 bg-zinc-900 transition-all duration-500"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          />

          {[{n:1,label:'Contact'},{n:2,label:'Livraison'},{n:3,label:'Paiement'}].map(({n,label}) => (
            <div key={n} className="flex flex-col items-center gap-2 z-10 bg-zinc-50 px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black transition-all border-2 ${
                step > n
                  ? 'bg-zinc-900 border-zinc-900 text-white'
                  : step === n
                    ? 'bg-white border-zinc-900 text-zinc-900'
                    : 'bg-white border-zinc-200 text-zinc-300'
              }`}>
                {step > n ? <Check className="w-3.5 h-3.5" /> : n}
              </div>
              <span className={`text-[8px] font-bold uppercase tracking-widest ${
                step >= n ? 'text-zinc-900' : 'text-zinc-300'
              }`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 pb-32 md:pb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col gap-6">
          
          {/* STEP 1: CONTACT */}
          {step === 1 && (
            <div className="max-w-lg mx-auto w-full animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 mb-1">Vos Informations</h2>
              <p className="text-xs text-zinc-400 font-medium mb-8">Étape 1 sur 3 — Données personnelles</p>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Nom Complet</label>
                  <input 
                    {...register('fullName')}
                    placeholder="Ex: Amine Benali"
                    className={`w-full px-4 py-4 bg-white border-2 rounded-xl text-sm font-bold outline-none transition-all text-zinc-900 ${
                      errors.fullName ? 'border-red-500' : 'border-zinc-200 focus:border-zinc-900'
                    }`}
                  />
                  {errors.fullName && <p className="text-[10px] text-red-500 font-bold mt-1.5">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Numéro de Téléphone</label>
                  <input 
                    {...register('phone')}
                    type="tel"
                    placeholder="0671234567"
                    className={`w-full px-4 py-4 bg-white border-2 rounded-xl text-sm font-bold outline-none transition-all text-zinc-900 ${
                      errors.phone ? 'border-red-500' : 'border-zinc-200 focus:border-zinc-900'
                    }`}
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1.5">{errors.phone.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DELIVERY */}
          {step === 2 && (
            <div className="max-w-lg mx-auto w-full animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 mb-1">Adresse de Livraison</h2>
              <p className="text-xs text-zinc-400 font-medium mb-8">Étape 2 sur 3 — Informations de livraison</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Wilaya</label>
                  <select 
                    {...register('wilaya')}
                    className={`w-full px-4 py-4 bg-white border-2 rounded-xl text-sm font-bold outline-none transition-all appearance-none text-zinc-900 ${
                      errors.wilaya ? 'border-red-500' : 'border-zinc-200 focus:border-zinc-900'
                    }`}
                  >
                    <option value="">Sélectionner une wilaya</option>
                    {ALGERIA_WILAYAS.map(w => (
                      <option key={w.code} value={w.name}>{w.code} - {w.name}</option>
                    ))}
                  </select>
                  {errors.wilaya && <p className="text-[10px] text-red-500 font-bold mt-1.5">{errors.wilaya.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Commune / Adresse exacte</label>
                  <input 
                    {...register('commune')}
                    placeholder="Ex: Rouiba, Cité 200..."
                    className={`w-full px-4 py-4 bg-white border-2 rounded-xl text-sm font-bold outline-none transition-all text-zinc-900 ${
                      errors.commune ? 'border-red-500' : 'border-zinc-200 focus:border-zinc-900'
                    }`}
                  />
                  {errors.commune && <p className="text-[10px] text-red-500 font-bold mt-1.5">{errors.commune.message}</p>}
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Type de Livraison</label>
                  <div className="flex flex-col gap-3">
                    <label className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      deliveryType === 'home' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}>
                      <input type="radio" value="home" {...register('deliveryType')} className="sr-only" />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-widest text-zinc-900">À Domicile</span>
                          <span className="text-[10px] font-bold text-zinc-500">Livraison jusqu'à votre porte</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-blue-600">
                        {selectedWilaya ? `${ALGERIA_WILAYAS.find(w => w.name === selectedWilaya)?.homeDelivery} DA` : '-'}
                      </span>
                    </label>

                    <label className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      deliveryType === 'desk' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}>
                      <input type="radio" value="desk" {...register('deliveryType')} className="sr-only" />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-widest text-zinc-900">Bureau (Yalidine)</span>
                          <span className="text-[10px] font-bold text-zinc-500">Récupération au bureau</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-amber-600">
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
            <div className="max-w-lg mx-auto w-full animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 mb-1">Récapitulatif</h2>
              <p className="text-xs text-zinc-400 font-medium mb-8">Étape 3 sur 3 — Confirmez votre commande</p>
              
              <div className="bg-white rounded-2xl border-2 border-zinc-100 p-5 mb-4">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Mode de Paiement</span>
                  <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <Check className="w-3 h-3" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">À la livraison</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-500 font-bold">Sous-total ({items.length} articles)</span>
                    <span className="text-sm font-black text-zinc-900">{totalPrice.toLocaleString('fr-DZ')} DA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-500 font-bold">Frais de livraison</span>
                    <span className="text-sm font-black text-blue-600">+{deliveryFee.toLocaleString('fr-DZ')} DA</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t-2 border-dashed border-zinc-200 flex justify-between items-end">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Total à Payer</span>
                  <span className="text-2xl font-black text-zinc-900">{finalTotal.toLocaleString('fr-DZ')} DA</span>
                </div>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Vos Informations</h3>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <p className="text-xs text-zinc-900 font-bold">{watchAll.fullName}</p>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <p className="text-xs text-zinc-900 font-bold">{watchAll.phone}</p>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <p className="text-xs text-zinc-900 font-bold">{watchAll.commune}, {watchAll.wilaya}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Modifier les informations →
                </button>
              </div>
            </div>
          )}

          {/* Sticky CTA (Mobile) / Normal CTA (Desktop) */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-zinc-200 z-50 md:static md:p-0 md:bg-transparent md:border-none md:backdrop-blur-none max-w-[1200px] md:max-w-lg mx-auto w-full">
            {step < 3 ? (
              <button 
                type="button"
                onClick={handleNextStep}
                className="w-full bg-zinc-900 text-white py-4 rounded-xl text-[11px] font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors shadow-xl"
              >
                Continuer <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-4 rounded-xl text-[11px] font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-xl disabled:opacity-60"
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
