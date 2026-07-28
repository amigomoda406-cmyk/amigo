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

  useEffect(() => {
    setMounted(true);
    if (!orderId) {
      router.replace('/');
    }
  }, [orderId, router]);

  if (!mounted || !orderId) return null;

  return (
    <main className="min-h-[100svh] bg-zinc-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8 animate-bounce-slow">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        
        <h1 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 mb-2">
          Commande Confirmée !
        </h1>
        <p className="text-sm text-zinc-500 font-medium mb-8 max-w-[280px]">
          Merci pour votre confiance. Nous avons bien reçu votre commande et allons la traiter rapidement.
        </p>

        <div className="w-full max-w-sm bg-white border border-zinc-100 rounded-2xl p-5 mb-8 text-left shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Numéro de commande</span>
          <span className="block text-lg font-mono font-black text-zinc-900 break-all">{orderId}</span>
        </div>

        <Link 
          href="/"
          className="bg-zinc-900 text-white px-8 py-4 rounded-full text-xs font-black tracking-widest uppercase flex items-center gap-2 hover:bg-zinc-800 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" /> Continuer vos achats
        </Link>
      </div>
    </main>
  );
}
