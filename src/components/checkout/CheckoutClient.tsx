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
    <main className="min-h-[100svh] bg-zinc-50 flex flex-col md:max-w-[800px] md:mx-auto md:bg-white md:shadow-2xl md:border-x md:border-zinc-200">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-white border-b border-zinc-200">
        <button 
          onClick={() => step > 1 ? setStep((prev) => (prev - 1) as 1 | 2) : router.back()} 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[11px] font-black tracking-widest uppercase text-zinc-900">Passer Commande</h1>
        <div className="w-10 h-10"></div>
      </header>

      {/* Stepper Indicator */}
      <div className="bg-white px-8 py-6 border-b border-zinc-100 flex justify-between relative">
        <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-zinc-100 -z-10 -translate-y-1/2"></div>
        
        {/* Step 1 */}
        <div className="flex flex-col items-center gap-2 bg-white px-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${step >= 1 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
            {step > 1 ? <Check className="w-3 h-3" /> : '1'}
          </div>
          <span className={`text-[8px] font-bold uppercase tracking-widest ${step >= 1 ? 'text-zinc-900' : 'text-zinc-400'}`}>Contact</span>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center gap-2 bg-white px-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${step >= 2 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
            {step > 2 ? <Check className="w-3 h-3" /> : '2'}
          </div>
          <span className={`text-[8px] font-bold uppercase tracking-widest ${step >= 2 ? 'text-zinc-900' : 'text-zinc-400'}`}>Livraison</span>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center gap-2 bg-white px-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${step >= 3 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
            3
          </div>
          <span className={`text-[8px] font-bold uppercase tracking-widest ${step >= 3 ? 'text-zinc-900' : 'text-zinc-400'}`}>Paiement</span>
        </div>
      </div>

      <div className="flex-1 p-4 pb-32">
        <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col gap-6">
          
          {/* STEP 1: CONTACT */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900 mb-6">Vos Informations</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Nom Complet</label>
                  <input 
                    {...register('fullName')}
                    placeholder="Ex: Amine Benali"
                    className={`w-full px-4 py-4 bg-white border-2 rounded-xl text-sm font-bold outline-none transition-all ${errors.fullName ? 'border-red-500' : 'border-zinc-200 focus:border-zinc-900'}`}
                  />
                  {errors.fullName && <p className="text-[10px] text-red-500 font-bold mt-1.5">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Numéro de Téléphone</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-900">0</span>
                    <input 
                      {...register('phone')}
                      type="tel"
                      placeholder="671234567"
                      className={`w-full pl-8 pr-4 py-4 bg-white border-2 rounded-xl text-sm font-bold outline-none transition-all ${errors.phone ? 'border-red-500' : 'border-zinc-200 focus:border-zinc-900'}`}
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1.5">{errors.phone.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DELIVERY */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900 mb-6">Adresse de Livraison</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Wilaya</label>
                  <select 
                    {...register('wilaya')}
                    className={`w-full px-4 py-4 bg-white border-2 rounded-xl text-sm font-bold outline-none transition-all appearance-none ${errors.wilaya ? 'border-red-500' : 'border-zinc-200 focus:border-zinc-900'}`}
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
                    className={`w-full px-4 py-4 bg-white border-2 rounded-xl text-sm font-bold outline-none transition-all ${errors.commune ? 'border-red-500' : 'border-zinc-200 focus:border-zinc-900'}`}
                  />
                  {errors.commune && <p className="text-[10px] text-red-500 font-bold mt-1.5">{errors.commune.message}</p>}
                </div>

                <div className="pt-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Type de Livraison</label>
                  <div className="flex flex-col gap-3">
                    <label className={`
                      relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between
                      ${deliveryType === 'home' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 bg-white hover:border-zinc-300'}
                    `}>
                      <input type="radio" value="home" {...register('deliveryType')} className="sr-only" />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Truck className="w-5 h-5" />
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

                    <label className={`
                      relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between
                      ${deliveryType === 'desk' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 bg-white hover:border-zinc-300'}
                    `}>
                      <input type="radio" value="desk" {...register('deliveryType')} className="sr-only" />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                          <MapPin className="w-5 h-5" />
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
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900 mb-6">Récapitulatif</h2>
              
              <div className="bg-white rounded-2xl border-2 border-zinc-100 p-5 mb-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Paiement</span>
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                    <Check className="w-3 h-3" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">À la livraison</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 font-bold">Sous-total ({items.length} articles)</span>
                    <span className="font-black text-zinc-900">{totalPrice.toLocaleString('fr-DZ')} DA</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 font-bold">Frais de livraison</span>
                    <span className="font-black text-blue-600">+{deliveryFee.toLocaleString('fr-DZ')} DA</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t-2 border-dashed border-zinc-200 flex justify-between items-end">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-900">Total à Payer</span>
                  <span className="text-2xl font-black text-zinc-900">{finalTotal.toLocaleString('fr-DZ')} DA</span>
                </div>
              </div>
              
              <div className="bg-zinc-50 rounded-xl p-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-2">Informations</h3>
                <p className="text-xs text-zinc-600 font-bold mb-1">{watchAll.fullName} • {watchAll.phone}</p>
                <p className="text-xs text-zinc-600 font-bold">{watchAll.commune}, {watchAll.wilaya}</p>
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="text-[10px] font-bold text-blue-600 mt-2 hover:underline"
                >
                  Modifier les informations
                </button>
              </div>
            </div>
          )}

          {/* Sticky CTA */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-zinc-100 z-50 md:max-w-[800px] md:mx-auto md:border-x md:border-zinc-200">
            {step < 3 ? (
              <button 
                type="button"
                onClick={handleNextStep}
                className="w-full bg-[#111] text-white py-4 rounded-xl text-[11px] font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors shadow-2xl"
              >
                Continuer <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-4 rounded-xl text-[11px] font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-2xl disabled:opacity-70"
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
