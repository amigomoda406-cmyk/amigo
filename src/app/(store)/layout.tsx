import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import FloatingCart from '@/components/cart/FloatingCart';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex items-start justify-center relative">
      <div className="w-full relative flex flex-col min-h-screen mx-auto">
        <Header />
        
        <main className="flex-1 flex flex-col pb-[65px] md:pb-0">
          {children}
        </main>

        <BottomNav />
        <FloatingCart />
        
        <SpeedInsights />
        <Analytics />
      </div>
    </div>
  );
}
