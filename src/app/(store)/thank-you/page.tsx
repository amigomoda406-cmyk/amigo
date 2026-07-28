import type { Metadata } from 'next';
import ThankYouClient from '@/components/checkout/ThankYouClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Merci pour votre commande | Amigo Moda',
  description: 'Votre commande a été confirmée.',
  robots: { index: false },
};

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center">Chargement...</div>}>
      <ThankYouClient />
    </Suspense>
  );
}
