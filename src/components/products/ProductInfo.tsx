'use client';
import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Minus, Plus, Loader2, Check, Truck, Package, RotateCcw } from 'lucide-react';
import { useCartStore } from '@/contexts/cart.store';
import { useRecentlyViewedStore } from '@/contexts/recently-viewed.store';
import { urlFor } from '@/lib/sanity/client';
import SizeGuideModal from '@/components/ui/SizeGuideModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductInfo({ product }: { product: any }) {
  const { addItem } = useCartStore();
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors && product.colors.length > 0 ? product.colors[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  
  const [showSizeError, setShowSizeError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [viewers, setViewers] = useState(12);
  const [timeLeft, setTimeLeft] = useState({ h: 11, m: 45, s: 30 });
  const addToCartRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Simulated live viewers
    setViewers(Math.floor(Math.random() * 15) + 5);
    const viewerInterval = setInterval(() => {
      setViewers(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 15000);

    // Simulated countdown timer for sale
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        if (s > 0) s--;
        else if (m > 0) { m--; s = 59; }
        else if (h > 0) { h--; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);

    // Add to recently viewed
    useRecentlyViewedStore.getState().add({
      _id: product._id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      comparePrice: product.comparePrice,
      images: product.images
    });

    // Intersection observer for sticky CTA
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky when the main button is scrolled past
        setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );

    if (addToCartRef.current) observer.observe(addToCartRef.current);
    return () => observer.disconnect();
  }, [product]);

  const discountPercent = product.comparePrice 
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      setShowSizeError(true);
      if ('vibrate' in navigator) navigator.vibrate([10, 10, 10]);
      return;
    }

    setIsAdding(true);
    if ('vibrate' in navigator) navigator.vibrate(20);

    // Convert Sanity image ref to actual URL string
    const rawImage = product.images?.[0];
    const imageUrl = rawImage && rawImage.asset
      ? urlFor(rawImage).width(400).height(500).url()
      : '';

    setTimeout(() => {
      addItem({
        productId: product._id,
        title: product.title,
        price: product.price,
        comparePrice: product.comparePrice,
        imageUrl: imageUrl,
        slug: product.slug.current,
        selectedSize: selectedSize || undefined,
        selectedColor: selectedColor || undefined,
        quantity: quantity
      });
      
      setIsAdding(false);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }, 600);
  };

  return (
    <div className="px-4 py-6 bg-white">
      {/* Meta */}
      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-3">
        <span>{product.parentCategory?.title}</span>
        <span>/</span>
        <span className="text-zinc-900">{product.subCategory?.title}</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 leading-none mb-3">
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
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-end gap-3">
          <span className="text-3xl font-black text-zinc-900 leading-none">
            {product.price.toLocaleString('fr-DZ')} DA
          </span>
          {product.comparePrice && (
            <div className="flex items-center gap-2 pb-1">
              <span className="text-sm font-bold text-zinc-400 line-through decoration-zinc-300">
                {product.comparePrice.toLocaleString('fr-DZ')} DA
              </span>
              <span className="text-[10px] font-black text-white bg-red-600 px-1.5 py-0.5 rounded animate-pulse">
                -{discountPercent}%
              </span>
            </div>
          )}
        </div>
        
        {/* Payment Installments (Idea 90) */}
        <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 rounded-lg p-2 w-fit">
          <svg className="w-4 h-4 text-[#C9A96E]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
          <p className="text-[10px] font-bold text-zinc-600">
            Ou payez en <span className="font-black text-zinc-900">3x de {(product.price / 3).toLocaleString('fr-DZ', {maximumFractionDigits: 0})} DA</span> sans frais
          </p>
        </div>
      </div>

      {/* Scarcity Triggers */}
      <div className="flex flex-col gap-2 mb-6">
        {/* Viewers */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 bg-zinc-50 py-2 px-3 rounded-xl border border-zinc-100 w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          {viewers} أشخاص ينظرون إلى هذا المنتج الآن
        </div>

        {/* Low Stock Warning */}
        {product.stockQuantity > 0 && product.stockQuantity < 5 && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-orange-600 bg-orange-50 py-2 px-3 rounded-xl border border-orange-100 w-fit">
            🔥 أسرع! متبقي {product.stockQuantity} قطع فقط في المخزون
          </div>
        )}

        {/* Flash Sale Timer (If discounted) */}
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
      {product.colors && product.colors.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black tracking-widest uppercase text-zinc-900">Couleur</span>
            <span className="text-[10px] font-bold text-zinc-500">{selectedColor}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color: any) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedColor === color.name ? 'border-zinc-900 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {product.sizes && product.sizes.length > 0 && (
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
            {product.sizes.map((size: any) => (
              <button
                key={size.label}
                disabled={!size.inStock}
                onClick={() => {
                  setSelectedSize(size.label);
                  setShowSizeError(false);
                }}
                className={`
                  relative overflow-hidden py-3 rounded-[12px] text-xs font-bold transition-all border
                  ${!size.inStock ? 'bg-zinc-50 text-zinc-300 border-zinc-100 cursor-not-allowed' : ''}
                  ${size.inStock && selectedSize !== size.label ? 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300' : ''}
                  ${selectedSize === size.label ? 'bg-zinc-900 text-white border-zinc-900' : ''}
                `}
              >
                {size.label}
                {!size.inStock && <div className="absolute inset-0 flex items-center justify-center overflow-hidden"><div className="w-full h-px bg-zinc-300 rotate-45"></div></div>}
              </button>
            ))}
          </div>
          {showSizeError && (
            <p className="text-[10px] font-bold text-red-500 mt-2">Veuillez sélectionner une taille.</p>
          )}
        </div>
      )}

      {/* Quantity */}
      <div className="mb-8">
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

      {/* Add to Cart Button */}
      <button
        ref={addToCartRef}
        disabled={!product.inStock || isAdding}
        onClick={handleAddToCart}
        className={`
          w-full py-4 rounded-full flex items-center justify-center gap-2 text-[11px] font-black tracking-widest uppercase transition-all shadow-lg
          ${!product.inStock ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : ''}
          ${product.inStock && !isAdding && !justAdded ? 'bg-black text-white hover:bg-[#C9A96E]' : ''}
          ${isAdding ? 'bg-zinc-800 text-white' : ''}
          ${justAdded ? 'bg-emerald-500 text-white' : ''}
        `}
      >
        {isAdding ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Ajout en cours...</>
        ) : justAdded ? (
          <><Check className="w-4 h-4" /> Ajouté ✓</>
        ) : (
          <><ShoppingBag className="w-4 h-4" /> {!product.inStock ? 'Rupture de stock' : 'Ajouter au panier'}</>
        )}
      </button>

      {/* Delivery Time Estimator (Idea 87) */}
      <div className="mt-4 flex items-center justify-center gap-2 text-zinc-500">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-[10px] font-bold tracking-wide">
          Commandez dans les <span className="text-zinc-900">2 prochaines heures</span> pour une livraison estimée le <span className="text-zinc-900 font-black">
            {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </p>
      </div>

      {/* Description & Details Accordions (Ideas 91, 93) */}
      <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col gap-4">
        {product.description && (
          <details className="group cursor-pointer">
            <summary className="flex items-center justify-between text-xs font-black tracking-widest uppercase text-zinc-900 select-none outline-none">
              Description
              <Plus className="w-4 h-4 transition-transform group-open:rotate-45" />
            </summary>
            <div className="mt-3 text-[11px] md:text-sm text-zinc-500 leading-relaxed font-medium pb-2">
              {typeof product.description === 'string' ? product.description : "Description détaillée du produit."}
            </div>
          </details>
        )}
        
        {/* Material & Care Instructions (Idea 93) */}
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

        {/* Product FAQs (Idea 91) */}
        <details className="group cursor-pointer">
          <summary className="flex items-center justify-between text-xs font-black tracking-widest uppercase text-zinc-900 select-none outline-none">
            Livraison & Retours
            <Plus className="w-4 h-4 transition-transform group-open:rotate-45" />
          </summary>
          <div className="mt-3 text-[11px] md:text-sm text-zinc-500 leading-relaxed font-medium pb-2 flex flex-col gap-2">
            <p><strong>Livraison:</strong> 2 à 4 jours ouvrables vers les 58 wilayas.</p>
            <p><strong>Retours:</strong> Vous disposez de 7 jours pour effectuer un retour si le produit ne vous convient pas.</p>
          </div>
        </details>
      </div>

      {/* Ask a Question & Social Share (Ideas 92, 94) */}
      <div className="mt-6 flex items-center justify-between">
        <a 
          href={`https://wa.me/213671815533?text=Je suis intéressé par le produit: ${product.title}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.8 5.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          Poser une question
        </a>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mr-2">Partager</span>
          <button className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 transition-colors">
            <svg className="w-3.5 h-3.5 text-zinc-600" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
          </button>
          <button className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 transition-colors">
            <svg className="w-3.5 h-3.5 text-zinc-600" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
          </button>
        </div>
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

      {/* Sticky Add to Cart (Mobile) */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-zinc-100 z-40 md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-zinc-900 truncate">{product.title}</p>
                <p className="text-[10px] font-bold text-blue-600">{product.price.toLocaleString('fr-DZ')} DA</p>
              </div>
              <button
                disabled={!product.inStock || isAdding}
                onClick={handleAddToCart}
                className="bg-zinc-900 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 flex-shrink-0"
              >
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : justAdded ? <Check className="w-4 h-4" /> : 'إضافة'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
