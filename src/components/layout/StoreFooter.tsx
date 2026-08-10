'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Check } from 'lucide-react';

export default function StoreFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="mt-auto relative bg-[#080808] text-white pt-20 pb-8 border-t border-zinc-900 overflow-hidden">
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0z\' fill=\'none\'/%3E%3Cpath d=\'M0 0h1v40H0zM40 0h1v40h-1zM0 0v1h40V0zM0 40v1h40v-1z\' fill=\'%23ffffff\' stroke-width=\'0.5\'/%3E%3C/svg%3E")',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Golden top accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent opacity-60" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center gap-6 mb-16">
          <Link href="/" className="flex flex-col items-center gap-3 group w-fit">
            <img src="/am-monogram.svg" alt="AM" className="w-10 h-10 opacity-90 group-hover:opacity-100 transition-opacity" />
            <div>
              <h2 className="text-xl font-black tracking-[0.15em] uppercase text-white group-hover:text-[#C9A96E] transition-colors">AMIGO MODA</h2>
              <div className="h-[2px] w-0 group-hover:w-full bg-[#C9A96E] transition-all duration-500 mx-auto" />
            </div>
          </Link>
          <p className="text-zinc-500 text-[11px] leading-relaxed font-medium max-w-sm">
            The ultimate fashion destination in Algeria. Elegance, quality and authenticity since 2024.
          </p>
          {/* Social Links */}
          <div className="flex items-center justify-center gap-4 mt-2">
            <a 
              href="https://www.instagram.com/amigo__moda" 
              target="_blank" rel="noopener noreferrer" 
              className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#dc2743] hover:border-transparent transition-all group"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a 
              href="https://www.tiktok.com/@amigo_moda3" 
              target="_blank" rel="noopener noreferrer" 
              className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-black hover:border-zinc-600 transition-all group"
              aria-label="TikTok"
            >
              <svg className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
              </svg>
            </a>
            <a 
              href="https://www.youtube.com/@amigomoda" 
              target="_blank" rel="noopener noreferrer" 
              className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-red-600 hover:border-red-600 transition-all group"
              aria-label="YouTube"
            >
              <svg className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 pb-[env(safe-area-inset-bottom)]">
          <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-medium">
            © {new Date().getFullYear()} AMIGO MODA. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {[
              { href: '/privacy', label: 'Privacy Policy' },
              { href: '/terms', label: 'Terms of Service' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="text-[10px] text-zinc-600 hover:text-white transition-colors uppercase tracking-widest font-medium">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
