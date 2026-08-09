import Header from '@/components/layout/Header';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
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
        <AnnouncementBar />
        <Header />
        
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        
        <SpeedInsights />
        <Analytics />
      </div>
    </div>
  );
}
