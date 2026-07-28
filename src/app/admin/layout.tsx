import Link from 'next/link';
import { LayoutDashboard, Settings } from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard | Amigo Moda',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <header className="bg-zinc-900 text-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <h1 className="text-sm font-black tracking-widest uppercase">AMIGO MODA <span className="text-blue-500">ADMIN</span></h1>
        
        <nav className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-white transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Vue d'ensemble
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-white transition-colors">
            <Settings className="w-4 h-4" /> Tarifs de Livraison
          </Link>
          <a href="/studio" target="_blank" className="text-xs font-bold text-zinc-300 hover:text-blue-400 transition-colors">
            Sanity Studio
          </a>
        </nav>
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
