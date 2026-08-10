'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/auth-context';
import { LogOut, Package, Heart, Settings, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-[100svh] bg-zinc-50 pb-20 pt-6 px-4 md:px-8 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8 border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-zinc-900">حسابي</h1>
        <button 
          onClick={async () => {
            await signOut();
            router.push('/');
          }}
          className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 transition-colors bg-red-50 px-4 py-2 rounded-full"
        >
          <LogOut className="w-4 h-4" /> تسجيل الخروج
        </button>
      </div>

      {/* User Info Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-black uppercase">
          {user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U'}
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900">{user.user_metadata?.full_name || 'مستخدم جديد'}</h2>
          <p className="text-sm font-medium text-zinc-500">{user.email}</p>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/account/orders" className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 hover:border-zinc-300 transition-colors flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-900">
            <Package className="w-6 h-6" />
          </div>
          <span className="text-sm font-black uppercase tracking-widest text-zinc-900">طلباتي</span>
        </Link>
        
        <Link href="/wishlist" className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 hover:border-zinc-300 transition-colors flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-900">
            <Heart className="w-6 h-6" />
          </div>
          <span className="text-sm font-black uppercase tracking-widest text-zinc-900">المفضلة</span>
        </Link>

        <Link href="/account/settings" className="col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 hover:border-zinc-300 transition-colors flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-900">
            <Settings className="w-6 h-6" />
          </div>
          <span className="text-sm font-black uppercase tracking-widest text-zinc-900">إعدادات الحساب</span>
        </Link>
      </div>
    </main>
  );
}
