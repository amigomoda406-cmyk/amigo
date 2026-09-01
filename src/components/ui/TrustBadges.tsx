'use client';

import { Truck, RotateCcw, Shield, Copy, MessageCircle } from 'lucide-react';

const trustBadges = [
  { icon: Truck, label: 'توصيل الـ 58 ولاية', sub: '2–4 أيام عمل' },
  { icon: RotateCcw, label: 'إرجاع مجاني', sub: 'خلال 7 أيام' },
  { icon: Shield, label: 'دفع آمن', sub: 'بياناتك محمية' },
];

interface TrustBadgesProps {
  productName?: string;
  productPrice?: number;
  productUrl?: string;
}

export default function TrustBadges({ productName, productPrice, productUrl }: TrustBadgesProps) {
  const shareUrl = productUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = productName
    ? `شوف هذا المنتج من Amigo Moda: ${productName} بـ ${productPrice} DA`
    : 'اكتشف مجموعة Amigo Moda الجديدة!';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      // toast.success('تم نسخ الرابط!');
    });
  };

  return (
    <div className="mt-5 space-y-4">
      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-zinc-100">
        {trustBadges.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center text-center gap-1.5">
            <div className="w-8 h-8 bg-zinc-50 rounded-full flex items-center justify-center">
              <Icon className="w-4 h-4 text-zinc-500" strokeWidth={1} />
            </div>
            <p className="text-[9px] font-black text-zinc-900 leading-tight">{label}</p>
            <p className="text-[8px] text-zinc-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Share Buttons */}
      <div className="flex gap-2 pt-3 border-t border-zinc-100">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white px-3 py-2.5 rounded-xl text-[10px] font-bold hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          واتساب
        </a>
        <button
          onClick={copyLink}
          className="flex-1 flex items-center justify-center gap-2 bg-zinc-100 text-zinc-700 px-3 py-2.5 rounded-xl text-[10px] font-bold hover:bg-zinc-200 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          نسخ الرابط
        </button>
      </div>
    </div>
  );
}
