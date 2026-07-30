'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, ArrowRight, Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';

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
    <main className="min-h-[100svh] bg-zinc-50 flex flex-col pt-10 pb-20">
      <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-6 w-full max-w-4xl mx-auto">
        
        {/* Animated Checkmark header */}
        <div className="flex flex-col items-center text-center mb-10 animate-fade-in-up">
          <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-black/20">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-[40px] md:text-[60px] font-black uppercase tracking-tighter text-zinc-900 leading-none mb-4">
            Merci <br />
            <span className="text-zinc-400">Pour Votre Achat</span>
          </h1>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest max-w-md">
            Votre commande a été confirmée et est en cours de préparation.
          </p>
        </div>

        {orderInfo ? (
          <div className="w-full bg-white rounded-[2rem] shadow-xl shadow-zinc-200/50 overflow-hidden animate-fade-in-up delay-100 border border-zinc-100/50">
            
            {/* Receipt Header */}
            <div className="bg-zinc-900 text-white p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Numéro de commande</span>
                <span className="block text-2xl md:text-3xl font-mono font-black break-all">{orderId.replace('AMIGO-', '')}</span>
              </div>
              <div className="text-left md:text-right">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Date</span>
                <span className="block text-lg font-bold">{new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Order Items */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6 border-b border-zinc-100 pb-4">Articles commandés</h3>
                <div className="space-y-6">
                  {orderInfo.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-20 h-20 bg-zinc-50 rounded-2xl overflow-hidden shrink-0 relative border border-zinc-100">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-black text-zinc-900 line-clamp-1">{item.title}</h4>
                        <div className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-widest">
                          Qté: {item.quantity} 
                          {item.selectedSize && ` • Taille: ${item.selectedSize}`}
                          {item.selectedColor && ` • Couleur: ${item.selectedColor}`}
                        </div>
                        <div className="text-sm font-black text-zinc-900 mt-1">{(item.price || 0).toLocaleString('fr-DZ')} DA</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary & Customer Info */}
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6 border-b border-zinc-100 pb-4">Détails de livraison</h3>
                  <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 mb-8">
                    <p className="text-sm font-black text-zinc-900 mb-1">{orderInfo.customer_name}</p>
                    <p className="text-sm font-bold text-zinc-500 mb-1">{orderInfo.customer_phone}</p>
                    <p className="text-sm font-bold text-zinc-500">{orderInfo.commune}, {orderInfo.wilaya}</p>
                    <div className="mt-4 pt-4 border-t border-zinc-200">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Mode de livraison</span>
                      <span className="text-sm font-black text-zinc-900">{orderInfo.delivery_type === 'home' ? 'À Domicile' : 'Point Relais / Bureau'}</span>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-black text-white rounded-2xl p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-zinc-400">Sous-total</span>
                    <span className="text-sm font-black">{(orderInfo.total_amount - orderInfo.delivery_fee).toLocaleString('fr-DZ')} DA</span>
                  </div>
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                    <span className="text-xs font-bold text-zinc-400">Livraison</span>
                    <span className="text-sm font-black">+{orderInfo.delivery_fee.toLocaleString('fr-DZ')} DA</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Total payé</span>
                    <span className="text-3xl font-black">{orderInfo.total_amount?.toLocaleString('fr-DZ')} DA</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        ) : (
          <div className="w-full max-w-sm bg-white border border-zinc-100 rounded-2xl p-8 mb-8 text-center shadow-xl animate-fade-in-up delay-300">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Numéro de commande</span>
            <span className="block text-2xl font-mono font-black text-zinc-900 break-all">{orderId}</span>
          </div>
        )}

        <div className="mt-12 flex flex-col md:flex-row gap-4 animate-fade-in-up delay-500 w-full md:w-auto">
          <Link 
            href="/"
            className="flex-1 md:flex-none bg-black text-white px-8 py-4 rounded-full text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors shadow-xl"
          >
            <Home className="w-4 h-4" /> Retour à l'accueil
          </Link>
          <Link 
            href="/#categories"
            className="flex-1 md:flex-none bg-white text-black border-2 border-black px-8 py-4 rounded-full text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors"
          >
            Continuer vos achats <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </main>
  );
}
