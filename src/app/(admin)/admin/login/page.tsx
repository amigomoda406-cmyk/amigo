'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Connexion réussie');
        router.push('/admin');
        router.refresh(); // Important to refresh layout state
      } else {
        toast.error('Identifiants incorrects');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-zinc-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-zinc-900" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-zinc-900">Accès Admin</h1>
          <p className="text-sm text-zinc-500 font-bold mt-2">Veuillez vous identifier</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nom d'utilisateur"
              className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-200 rounded-xl text-sm font-bold outline-none transition-all focus:border-zinc-900 focus:bg-white"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-200 rounded-xl text-sm font-bold outline-none transition-all focus:border-zinc-900 focus:bg-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-zinc-900 text-white py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center justify-center disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Connexion'}
          </button>
        </form>
      </div>
    </div>
  );
}
