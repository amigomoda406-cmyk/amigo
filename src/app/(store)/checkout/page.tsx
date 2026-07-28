import type { Metadata } from 'next';
import CheckoutClient from '@/components/checkout/CheckoutClient';

export const metadata: Metadata = {
  title: 'Passer Commande | Amigo Moda',
  description: 'Finalisez votre commande rapidement et facilement.',
  robots: { index: false },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
