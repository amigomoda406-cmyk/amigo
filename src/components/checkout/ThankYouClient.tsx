'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThankYouClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    // Read order info
    const storedOrder = sessionStorage.getItem('lastOrder');
    if (storedOrder) {
      setOrderInfo(JSON.parse(storedOrder));
    }
    if (!orderId) {
      router.replace('/');
    }
  }, [orderId, router]);

  if (!mounted || !orderId) return null;

  return (
    <main className="min-h-[100svh] bg-zinc-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto py-12">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce-in shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        
        <h1 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 mb-2 animate-fade-in-up delay-100">
          Commande Confirmée !
        </h1>
        <p className="text-sm text-zinc-500 font-medium mb-10 text-center max-w-sm animate-fade-in-up delay-200">
          Merci pour votre confiance. Nous avons bien reçu votre commande et allons la traiter rapidement.
        </p>

        {orderInfo && (
          <div className="w-full bg-white border-2 border-zinc-100 rounded-3xl p-6 md:p-8 mb-10 text-left shadow-sm animate-fade-in-up delay-300">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6 border-b-2 border-dashed border-zinc-100 pb-4">Récapitulatif de votre commande</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Numéro de commande</span>
                <span className="block text-lg font-mono font-black text-zinc-900 break-all">{orderId}</span>
              </div>
              
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Informations Client</span>
                <p className="text-sm font-bold text-zinc-900 mb-1">{orderInfo.customer_name}</p>
                <p className="text-sm font-bold text-zinc-900 mb-1">{orderInfo.customer_phone}</p>
                <p className="text-sm font-bold text-zinc-900">{orderInfo.commune}, {orderInfo.wilaya}</p>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-zinc-100 pt-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-zinc-500 font-bold">Frais de livraison ({orderInfo.delivery_type === 'home' ? 'À Domicile' : 'Bureau'})</span>
                <span className="text-sm font-black text-blue-600">+{orderInfo.delivery_fee?.toLocaleString('fr-DZ')} DA</span>
              </div>
              <div className="flex justify-between items-end mt-4">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Total à Payer</span>
                <span className="text-3xl font-black text-zinc-900">{orderInfo.total_amount?.toLocaleString('fr-DZ')} DA</span>
              </div>
            </div>
          </div>
        )}

        {!orderInfo && (
          <div className="w-full max-w-sm bg-white border border-zinc-100 rounded-2xl p-5 mb-8 text-left shadow-sm animate-fade-in-up delay-300">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Numéro de commande</span>
            <span className="block text-lg font-mono font-black text-zinc-900 break-all">{orderId}</span>
          </div>
        )}

        <Link 
          href="/"
          className="bg-zinc-900 text-white px-8 py-4 rounded-xl text-xs font-black tracking-widest uppercase flex items-center gap-2 hover:bg-zinc-800 transition-colors animate-fade-in-up delay-400 shadow-xl"
        >
          <ShoppingBag className="w-4 h-4" /> Continuer vos achats
        </Link>
      </div>
    </main>
  );
}
