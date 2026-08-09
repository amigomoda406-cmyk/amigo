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
    product.colors && product.colors.length > 0 ? product.colors[0].name : null
  );
  const [quantity, setQuantity] = useState(1);
  
  const [showSizeError, setShowSizeError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const addToCartRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
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
      <div className="flex items-end gap-3 mb-8">
        <span className="text-3xl font-black text-zinc-900 leading-none">
          {product.price.toLocaleString('fr-DZ')} DA
        </span>
        {product.comparePrice && (
          <div className="flex items-center gap-2 pb-1">
            <span className="text-sm font-bold text-zinc-400 line-through">
              {product.comparePrice.toLocaleString('fr-DZ')} DA
            </span>
            <span className="text-[10px] font-black text-white bg-blue-600 px-1.5 py-0.5 rounded">
              -{discountPercent}%
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
          w-full py-4 rounded-full flex items-center justify-center gap-2 text-[11px] font-black tracking-widest uppercase transition-all
          ${!product.inStock ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : ''}
          ${product.inStock && !isAdding && !justAdded ? 'bg-zinc-900 text-white hover:bg-zinc-800' : ''}
          ${isAdding ? 'bg-zinc-800 text-white' : ''}
          ${justAdded ? 'bg-emerald-600 text-white' : ''}
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

      {/* Description */}
      {product.description && (
        <div className="mt-10 pt-8 border-t border-zinc-100">
          <h3 className="text-xs font-black tracking-widest uppercase text-zinc-900 mb-4">Description</h3>
          <div className="text-sm text-zinc-500 leading-relaxed font-medium">
            {/* If using portable text, you'd parse it here. For simplicity, we just render strings if it's simple text */}
            {typeof product.description === 'string' ? product.description : "Description détaillée du produit."}
          </div>
        </div>
      )}
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
