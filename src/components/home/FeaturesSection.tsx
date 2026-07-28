import { Globe, Tag } from 'lucide-react';

export default function FeaturesSection() {
  return (
    <section className="grid grid-cols-2 bg-zinc-900 text-white divide-x divide-zinc-800">
      <div className="p-3 md:p-6 flex items-center justify-center gap-2 md:gap-4">
        <div className="w-6 h-6 md:w-12 md:h-12 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
          <Tag className="w-3 h-3 md:w-6 md:h-6 text-zinc-300" />
        </div>
        <div className="flex flex-col">
          <span className="text-[6px] md:text-xs text-zinc-400 font-bold uppercase tracking-widest mb-0.5 md:mb-1">Limited Time Offer</span>
          <span className="text-[9px] md:text-base font-black uppercase tracking-wider leading-none">Up to 50% Off</span>
        </div>
      </div>
      <div className="p-3 md:p-6 flex items-center justify-center gap-2 md:gap-4">
        <div className="w-6 h-6 md:w-12 md:h-12 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
          <Globe className="w-3 h-3 md:w-6 md:h-6 text-zinc-300" />
        </div>
        <div className="flex flex-col">
          <span className="text-[7px] md:text-sm font-bold uppercase tracking-wider mb-0.5 leading-none">Free Shipping</span>
          <span className="text-[6px] md:text-xs text-zinc-400 leading-none mt-0.5 md:mt-1">On orders over $75</span>
        </div>
      </div>
    </section>
  );
}
