import { Truck, ShieldCheck, RefreshCcw, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Livraison Rapide',
    subtitle: '58 wilayas couvertes',
    color: '#C9A96E',
  },
  {
    icon: ShieldCheck,
    title: 'Paiement Sécurisé',
    subtitle: 'À la livraison',
    color: '#10b981',
  },
  {
    icon: RefreshCcw,
    title: 'Retours Faciles',
    subtitle: '7 jours pour retourner',
    color: '#6366f1',
  },
  {
    icon: Headphones,
    title: 'Support 7j/7',
    subtitle: 'WhatsApp & Appel',
    color: '#f59e0b',
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-white border-b border-zinc-100">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-zinc-100">
        {features.map(({ icon: Icon, title, subtitle, color }) => (
          <div
            key={title}
            className="flex items-center gap-3 md:gap-4 px-4 py-5 md:px-8 md:py-6 group hover:bg-zinc-50 transition-colors duration-200"
          >
            <div
              className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-200"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="w-4 h-4 md:w-5 md:h-5" style={{ color }} strokeWidth={2} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-wider text-zinc-900 leading-tight">{title}</span>
              <span className="text-[9px] md:text-[10px] font-medium text-zinc-400 leading-tight mt-0.5 truncate">{subtitle}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
