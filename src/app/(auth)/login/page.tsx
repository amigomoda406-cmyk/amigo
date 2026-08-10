'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('تم تسجيل الدخول بنجاح');
      router.push('/account');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-20">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 mb-2">مرحباً بعودتك</h1>
          <p className="text-sm font-medium text-zinc-500">سجل دخولك لمتابعة طلباتك ومفضلاتك</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-900 mb-1.5 uppercase tracking-widest">البريد الإلكتروني</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-900 mb-1.5 uppercase tracking-widest">كلمة المرور</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-zinc-900 text-white py-4 rounded-xl text-[11px] font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors mt-6"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تسجيل الدخول'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm font-medium text-zinc-500">
          ليس لديك حساب؟ {' '}
          <Link href="/register" className="text-zinc-900 font-bold underline hover:text-blue-600 transition-colors">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </main>
  );
}
