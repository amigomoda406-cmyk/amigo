'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Minus, Plus, Loader2, Check, Truck, Package, RotateCcw, Zap } from 'lucide-react';
import { useCartStore } from '@/contexts/cart.store';
import { useRecentlyViewedStore } from '@/contexts/recently-viewed.store';
import { urlFor } from '@/lib/sanity/client';
import SizeGuideModal from '@/components/ui/SizeGuideModal';
import { motion, AnimatePresence } from 'framer-motion';
import { fbEvent } from '@/components/analytics/FacebookPixel';

export default function ProductInfo({ product, onImageChange }: { product: any; onImageChange?: (images: any[]) => void }) {
  const { addItem } = useCartStore();
  const router = useRouter();

  // الحصول على المقاسات من الحقل الصحيح
  const availableSizes = product.sizeType === 'shoes'
    ? (product.shoeSizes || [])
    : product.sizeType === 'clothing'
    ? (product.clothingSizes || [])
    : [];

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colorVariants && product.colorVariants.length > 0
      ? (product.colorVariants[0].color || null)
      : null
  );
  const [quantity, setQuantity] = useState(1);
  const [showSizeError, setShowSizeError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [viewers, setViewers] = useState(12);
  const [timeLeft, setTimeLeft] = useState({ h: 11, m: 45, s: 30 });
  const addToCartRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fbEvent('ViewContent', {
      content_name: product.title,
      content_category: product.parentCategory?.title || 'Apparel',
      content_ids: [product._id],
      content_type: 'product',
      value: product.price,
      currency: 'DZD'
    });

    setViewers(Math.floor(Math.random() * 15) + 5);
    const viewerInterval = setInterval(() => {
      setViewers(prev => Math.max(3, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 15000);

    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        if (s > 0) s--;
        else if (m > 0) { m--; s = 59; }
        else if (h > 0) { h--; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);

    useRecentlyViewedStore.getState().add({
      _id: product._id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      comparePrice: product.comparePrice,
      images: product.images
    });

    return () => {
      clearInterval(viewerInterval);
      clearInterval(timerInterval);
    };
  }, [product]);

  // عند تغيير اللون → غيّر صور المنتج
  useEffect(() => {
    if (!product.colorVariants || !onImageChange) return;
    const selected = product.colorVariants.find((v: any) => v.color === selectedColor);
    if (selected?.images && selected.images.length > 0) {
      onImageChange(selected.images);
    } else {
      onImageChange(product.images || []);
    }
  }, [selectedColor]);

  const discountPercent = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  const getImageUrl = () => {
    const rawImage = product.images?.[0];
    return rawImage?.asset ? urlFor(rawImage).width(400).height(500).url() : '';
  };

  const validateAndAddToCart = (): boolean => {
    if (availableSizes.length > 0 && !selectedSize) {
      setShowSizeError(true);
      if ('vibrate' in navigator) navigator.vibrate([10, 10, 10]);
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateAndAddToCart()) return;

    setIsAdding(true);
    if ('vibrate' in navigator) navigator.vibrate(20);

    setTimeout(() => {
      addItem({
        productId: product._id,
        title: product.title,
        price: product.price,
        comparePrice: product.comparePrice,
        imageUrl: getImageUrl(),
        slug: product.slug.current,
        selectedSize: selectedSize || undefined,
        selectedColor: selectedColor || undefined,
        quantity: quantity
      });

      fbEvent('AddToCart', {
        content_name: product.title,
        content_type: 'product',
        content_ids: [product._id],
        value: product.price * quantity,
        currency: 'DZD'
      });

      setIsAdding(false);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }, 400);
  };

  const handleOrderNow = () => {
    if (!validateAndAddToCart()) return;

    setIsOrdering(true);
    addItem({
      productId: product._id,
      title: product.title,
      price: product.price,
      comparePrice: product.comparePrice,
      imageUrl: getImageUrl(),
      slug: product.slug.current,
      selectedSize: selectedSize || undefined,
      selectedColor: selectedColor || undefined,
      quantity: quantity
    });

    fbEvent('InitiateCheckout', {
      content_ids: [product._id],
      value: product.price * quantity,
      currency: 'DZD'
    });

    router.push('/checkout');
  };

  return (
    <div className="px-4 py-8 bg-white">
      {/* Meta breadcrumb */}
      <div className="flex items-center gap-1.5 text-[9px] font-black tracking-[0.15em] uppercase text-zinc-400 mb-4">
        <span>{product.parentCategory?.title}</span>
        <span className="text-zinc-200">›</span>
        <span className="text-zinc-600">{product.subCategory?.title}</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-zinc-900 leading-[1.05] mb-4">
        {product.title}
      </h1>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-5">
        {product.isNew && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
            Nouveau
          </span>
        )}
        {product.isTrending && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
            Tendance
          </span>
        )}
        {!product.inStock && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
            Rupture de stock
          </span>
        )}
      </div>

      {/* Pricing */}
      <div className="flex flex-col gap-3 mb-6 pb-6 border-b border-zinc-100">
        <div className="flex items-baseline gap-3">
          <span className="text-[2rem] md:text-[2.25rem] font-black text-black leading-none tracking-tight">
            {product.price.toLocaleString('fr-DZ')} <span className="text-lg font-bold text-zinc-500">DA</span>
          </span>
          {product.comparePrice && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-300 line-through">
                {product.comparePrice.toLocaleString('fr-DZ')} DA
              </span>
              <span className="text-[10px] font-black text-white bg-red-500 px-2 py-0.5 rounded-full">
                -{discountPercent}%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100/80 rounded-xl px-3 py-2 w-fit">
          <span className="text-[#C9A96E] text-sm">✦</span>
          <p className="text-[10px] font-bold text-amber-900">
            Ou <span className="font-black">3x {(product.price / 3).toLocaleString('fr-DZ', {maximumFractionDigits: 0})} DA</span> sans frais
          </p>
        </div>
      </div>

      {/* Scarcity Triggers */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 bg-zinc-50 py-2 px-3 rounded-xl border border-zinc-100 w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          {viewers} أشخاص ينظرون إلى هذا المنتج الآن
        </div>

        {product.comparePrice && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-red-600 bg-red-50 py-2 px-3 rounded-xl border border-red-100 w-fit">
            ⏳ ينتهي العرض خلال:
            <span className="font-black tracking-widest text-red-700 bg-white px-1.5 py-0.5 rounded border border-red-200">
              {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* Colors */}
      {product.colorVariants && product.colorVariants.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black tracking-widest uppercase text-zinc-900">Couleur</span>
            <span className="text-[10px] font-bold text-zinc-500">{selectedColor}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {product.colorVariants.map((variant: any) => (
              <button
                key={variant.color}
                onClick={() => setSelectedColor(variant.color)}
                title={variant.color}
                className={`w-9 h-9 rounded-full border-[3px] transition-all shadow-sm ${
                  selectedColor === variant.color
                    ? 'border-zinc-900 scale-110 shadow-md'
                    : 'border-zinc-200 hover:scale-105'
                }`}
                style={{ backgroundColor: variant.color }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {availableSizes.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[10px] font-black tracking-widest uppercase transition-colors ${showSizeError ? 'text-red-500' : 'text-zinc-900'}`}>
              Taille
            </span>
            <button
              className="text-[10px] font-bold text-zinc-500 underline underline-offset-2 hover:text-zinc-900 transition-colors"
              onClick={() => setSizeGuideOpen(true)}
            >
              دليل المقاسات ↗
            </button>
          </div>

          <div className={`grid grid-cols-4 gap-2 transition-transform ${showSizeError ? 'animate-shake' : ''}`}>
            {availableSizes.map((size: string) => (
              <button
                key={size}
                onClick={() => {
                  setSelectedSize(size);
                  setShowSizeError(false);
                }}
                className={`
                  py-3 rounded-[12px] text-xs font-bold transition-all border
                  ${selectedSize === size ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-400'}
                `}
              >
                {size}
              </button>
            ))}
          </div>
          {showSizeError && (
            <p className="text-[10px] font-bold text-red-500 mt-2">Veuillez sélectionner une taille.</p>
          )}
        </div>
      )}

      {/* Quantity */}
      <div className="mb-6">
        <span className="text-[10px] font-black tracking-widest uppercase text-zinc-900 block mb-3">Quantité</span>
        <div className="flex items-center w-[120px] bg-zinc-100 rounded-full p-1">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-zinc-900 shadow-sm"
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="flex-1 text-center text-xs font-black">{quantity}</span>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-zinc-900 shadow-sm"
            onClick={() => setQuantity(q => Math.min(10, q + 1))}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 mb-6">
        {/* اطلب الآن */}
        <button
          ref={addToCartRef}
          disabled={!product.inStock || isOrdering}
          onClick={handleOrderNow}
          className={`
            w-full py-[1.1rem] rounded-2xl flex items-center justify-center gap-2.5 text-[11px] font-black tracking-[0.15em] uppercase transition-all duration-300
            shadow-[0_8px_30px_rgba(201,169,110,0.4)] hover:shadow-[0_12px_40px_rgba(201,169,110,0.5)]
            ${!product.inStock ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none' : 'bg-[#C9A96E] text-white hover:bg-[#b8934f] hover:scale-[1.01] active:scale-[0.99]'}
          `}
        >
          {isOrdering ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحويل...</>
          ) : (
            <><Zap className="w-4 h-4" /> اطلب الآن</>
          )}
        </button>

        {/* أضف للسلة */}
        <button
          disabled={!product.inStock || isAdding}
          onClick={handleAddToCart}
          className={`
            w-full py-[1rem] rounded-2xl flex items-center justify-center gap-2.5 text-[11px] font-black tracking-[0.15em] uppercase transition-all duration-300 border-2
            ${!product.inStock ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border-zinc-100' : ''}
            ${product.inStock && !isAdding && !justAdded ? 'bg-white text-zinc-900 border-zinc-900 hover:bg-zinc-900 hover:text-white' : ''}
            ${isAdding ? 'bg-zinc-800 text-white border-zinc-800' : ''}
            ${justAdded ? 'bg-emerald-500 text-white border-emerald-500' : ''}
          `}
        >
          {isAdding ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Ajout en cours...</>
          ) : justAdded ? (
            <><Check className="w-5 h-5" /> Ajouté au panier ✓</>
          ) : (
            <><ShoppingBag className="w-4 h-4" /> {!product.inStock ? 'Rupture de stock' : 'Ajouter au panier'}</>
          )}
        </button>
      </div>

      {/* Delivery info */}
      <div className="flex items-center justify-center gap-2 text-zinc-500 mb-8">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-[10px] font-bold tracking-wide">
          Commandez dans les <span className="text-zinc-900">2 prochaines heures</span> pour livraison estimée le{' '}
          <span className="text-zinc-900 font-black">
            {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </p>
      </div>

      {/* Description & Details Accordions */}
      <div className="pt-6 border-t border-zinc-100 flex flex-col gap-4">
        {product.description && (
          <details className="group cursor-pointer">
            <summary className="flex items-center justify-between text-xs font-black tracking-widest uppercase text-zinc-900 select-none outline-none">
              Description
              <Plus className="w-4 h-4 transition-transform group-open:rotate-45" />
            </summary>
            <div className="mt-3 text-[11px] md:text-sm text-zinc-500 leading-relaxed font-medium pb-2">
              {typeof product.description === 'string' ? product.description : 'Description détaillée du produit.'}
            </div>
          </details>
        )}

        <details className="group cursor-pointer">
          <summary className="flex items-center justify-between text-xs font-black tracking-widest uppercase text-zinc-900 select-none outline-none">
            Matière & Entretien
            <Plus className="w-4 h-4 transition-transform group-open:rotate-45" />
          </summary>
          <div className="mt-3 text-[11px] md:text-sm text-zinc-500 leading-relaxed font-medium pb-2 flex flex-col gap-2">
            <p>100% Coton Premium. Fabriqué avec soin.</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="p-2 bg-zinc-50 rounded-full text-xs" title="Lavage en machine à 30°C">🌊</span>
              <span className="p-2 bg-zinc-50 rounded-full text-xs" title="Ne pas repasser sur l'impression">🚫🌡️</span>
              <span className="p-2 bg-zinc-50 rounded-full text-xs" title="Séchage à plat">👕</span>
            </div>
          </div>
        </details>

        <details className="group cursor-pointer">
          <summary className="flex items-center justify-between text-xs font-black tracking-widest uppercase text-zinc-900 select-none outline-none">
            Livraison & Retours
            <Plus className="w-4 h-4 transition-transform group-open:rotate-45" />
          </summary>
          <div className="mt-3 text-[11px] md:text-sm text-zinc-500 leading-relaxed font-medium pb-2 flex flex-col gap-2">
            <p><strong>Livraison:</strong> 2 à 4 jours ouvrables vers les 58 wilayas.</p>
            <p><strong>Retours:</strong> Vous disposez de 7 jours pour effectuer un retour.</p>
          </div>
        </details>
      </div>

      {/* WhatsApp */}
      <div className="mt-6 pt-4 border-t border-zinc-100">
        <a
          href={`https://wa.me/213671815533?text=Je suis intéressé par le produit: ${product.title}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.8 5.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          Poser une question
        </a>
      </div>

      {/* Delivery info mini */}
      <div className="mt-4 pt-4 border-t border-zinc-50 flex flex-col gap-1.5">
        {[{icon: Truck, text: 'توصيل لجميع الولايات الـ 58'}, {icon: Package, text: 'تغليف محكم ومضمون'}, {icon: RotateCcw, text: 'إرجاع مجاني خلال 7 أيام'}].map(({icon: Icon, text}) => (
          <div key={text} className="flex items-center gap-2">
            <Icon className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" strokeWidth={1} />
            <p className="text-[10px] font-medium text-zinc-500">{text}</p>
          </div>
        ))}
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        type={product.sizeType === 'shoes' ? 'shoes' : 'clothing'}
      />
    </div>
  );
}
