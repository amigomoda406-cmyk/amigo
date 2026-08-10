import Link from 'next/link';

import Link from 'next/link';

export default function StoreFooter() {
  return (
    <footer className="mt-auto relative bg-[#0a0a0a] text-white pt-16 pb-8 border-t border-zinc-800 overflow-hidden">
      {/* Brand Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0l30 30-30 30L0 30z\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'1\'/%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'15\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'1\'/%3E%3C/svg%3E")',
          backgroundSize: '60px 60px'
        }}
      />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand Info */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3">
              <img src="/am-monogram.svg" alt="AM" className="w-8 h-8 text-[#C9A96E]" />
              <h2 className="text-xl font-black tracking-[0.1em] uppercase">AMIGO MODA</h2>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed">
              La destination ultime pour la mode masculine en Algérie. Élégance, qualité et authenticité depuis 2024.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/amigo__moda" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-[#C9A96E] hover:border-[#C9A96E] hover:text-black transition-all group">
                <svg className="w-4 h-4 text-white group-hover:text-black transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@amigo_moda3" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-[#C9A96E] hover:border-[#C9A96E] hover:text-black transition-all group">
                <svg className="w-4 h-4 text-white group-hover:text-black transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[#C9A96E] font-bold text-sm tracking-widest uppercase">Navigation</h3>
            <ul className="flex flex-col gap-4 text-sm text-zinc-400">
              <li><Link href="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Boutique</Link></li>
              <li><Link href="/lookbook" className="hover:text-white transition-colors">Lookbook</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">À Propos</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[#C9A96E] font-bold text-sm tracking-widest uppercase">Service Client</h3>
            <ul className="flex flex-col gap-4 text-sm text-zinc-400">
              <li><Link href="/contact" className="hover:text-white transition-colors">Nous Contacter</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Livraison (58 Wilayas)</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Retours & Échanges</Link></li>
              <li><Link href="/size-guide" className="hover:text-white transition-colors">Guide des Tailles</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[#C9A96E] font-bold text-sm tracking-widest uppercase">Newsletter</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Inscrivez-vous pour recevoir des offres exclusives et les dernières nouveautés.
            </p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Votre adresse email" 
                className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#C9A96E] transition-colors"
              />
              <button className="bg-white text-black font-bold text-sm rounded-lg px-4 py-3 hover:bg-[#C9A96E] transition-colors">
                S'inscrire
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-medium">
            © {new Date().getFullYear()} AMIGO MODA. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
