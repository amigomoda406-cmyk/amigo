import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'fr' | 'en' | 'ar';

export const langs: Lang[] = ['fr', 'en', 'ar'];

// Labels for each language button
export const langLabels: Record<Lang, string> = {
  fr: 'FR',
  en: 'EN',
  ar: 'AR',
};

// Basic UI translations
export const translations: Record<Lang, Record<string, string>> = {
  fr: {
    trending: 'Tendance',
    shoes: 'Chaussures',
    clothes: 'Vêtements',
    accessories: 'Accessoires',
    shopNow: 'Acheter',
    addToCart: 'Ajouter au panier',
    cart: 'Panier',
    checkout: 'Commander',
    newCollection: 'Nouvelle Collection',
    dropNowLive: 'Drop Now Live',
    trendingNow: 'Tendance Maintenant',
    newArrivals: 'Nouveautés',
    categories: 'Catégories',
    deliveryFree: 'Livraison Gratuite',
    returns: 'Retours Faciles',
    support: 'Support 24/7',
    size: 'Taille',
    color: 'Couleur',
    quantity: 'Quantité',
    total: 'Total',
    delivery: 'Livraison',
    subtotal: 'Sous-total',
    emptyCart: 'Votre panier est vide',
    confirmOrder: 'Confirmer la commande',
    fullName: 'Nom Complet',
    phone: 'Numéro de Téléphone',
    wilaya: 'Wilaya',
    commune: 'Commune / Adresse exacte',
    homeDelivery: 'À Domicile',
    deskDelivery: 'Bureau',
    payOnDelivery: 'Paiement à la livraison',
    orderConfirmed: 'Commande Confirmée !',
    thankYou: 'Merci Pour Votre Achat',
    continueShopping: 'Continuer vos achats',
  },
  en: {
    trending: 'Trending',
    shoes: 'Shoes',
    clothes: 'Clothes',
    accessories: 'Accessories',
    shopNow: 'Shop Now',
    addToCart: 'Add to Cart',
    cart: 'Cart',
    checkout: 'Checkout',
    newCollection: 'New Collection',
    dropNowLive: 'Drop Now Live',
    trendingNow: 'Trending Now',
    newArrivals: 'New Arrivals',
    categories: 'Categories',
    deliveryFree: 'Free Delivery',
    returns: 'Easy Returns',
    support: '24/7 Support',
    size: 'Size',
    color: 'Color',
    quantity: 'Quantity',
    total: 'Total',
    delivery: 'Delivery',
    subtotal: 'Subtotal',
    emptyCart: 'Your cart is empty',
    confirmOrder: 'Confirm Order',
    fullName: 'Full Name',
    phone: 'Phone Number',
    wilaya: 'Wilaya',
    commune: 'City / Exact Address',
    homeDelivery: 'Home Delivery',
    deskDelivery: 'Pickup Point',
    payOnDelivery: 'Pay on Delivery',
    orderConfirmed: 'Order Confirmed!',
    thankYou: 'Thank You For Your Purchase',
    continueShopping: 'Continue Shopping',
  },
  ar: {
    trending: 'الأكثر رواجاً',
    shoes: 'أحذية',
    clothes: 'ملابس',
    accessories: 'إكسسوارات',
    shopNow: 'تسوق الآن',
    addToCart: 'أضف للسلة',
    cart: 'السلة',
    checkout: 'إتمام الطلب',
    newCollection: 'مجموعة جديدة',
    dropNowLive: 'متاح الآن',
    trendingNow: 'الأكثر رواجاً الآن',
    newArrivals: 'وصل حديثاً',
    categories: 'الأقسام',
    deliveryFree: 'توصيل مجاني',
    returns: 'إرجاع سهل',
    support: 'دعم 24/7',
    size: 'المقاس',
    color: 'اللون',
    quantity: 'الكمية',
    total: 'الإجمالي',
    delivery: 'التوصيل',
    subtotal: 'المجموع الجزئي',
    emptyCart: 'سلتك فارغة',
    confirmOrder: 'تأكيد الطلب',
    fullName: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    wilaya: 'الولاية',
    commune: 'البلدية / العنوان الدقيق',
    homeDelivery: 'توصيل للمنزل',
    deskDelivery: 'نقطة استلام',
    payOnDelivery: 'الدفع عند الاستلام',
    orderConfirmed: 'تم تأكيد الطلب!',
    thankYou: 'شكراً على تسوقك',
    continueShopping: 'مواصلة التسوق',
  },
};

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

export const useLangStore = create<LangState>()(
  persist(
    (set, get) => ({
      lang: 'fr',
      setLang: (lang: Lang) => set({ lang }),
      t: (key: string) => {
        const { lang } = get();
        return translations[lang]?.[key] ?? translations['fr'][key] ?? key;
      },
    }),
    { name: 'lang-storage' }
  )
);
