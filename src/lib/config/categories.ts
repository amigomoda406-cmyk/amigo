export const CATEGORY_CONFIG = {
  shoes: {
    nameEn: 'Shoes',
    nameFr: 'Chaussures',
    accentColor: '#E94560',
    featuredImage: 'https://res.cloudinary.com/doxg77zqk/image/upload/v1785165180/%D8%BA%D9%8A%D8%B1_%D8%A7%D9%84%D9%83%D9%84%D8%A7%D9%85_%D8%A7%D9%84%D9%85%D9%88%D8%AC%D9%88%D8%AF_%D9%88%D8%B1%D8%A7_%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC_202607271601.jpg',
    subCategories: [
      { id: 'sneakers', name: 'Sneakers', description: 'Style urbain et confort', href: '/category/shoes/sneakers', icon: '🏀' },
      { id: 'chaussures-decontractees', name: 'Chaussures décontractées', description: 'Pour tous les jours', href: '/category/shoes/chaussures-decontractees', icon: '👞' },
      { id: 'chaussures-sport', name: 'Chaussures de sport', description: 'Performance & style', href: '/category/shoes/chaussures-sport', icon: '⚽' },
    ],
  },
  clothes: {
    nameEn: 'Clothes',
    nameFr: 'Vêtements',
    accentColor: '#F5A623',
    featuredImage: 'https://res.cloudinary.com/doxg77zqk/image/upload/v1785165210/Change_writing_to_hoodie_2K_202607271601.jpg',
    subCategories: [
      { id: 't-shirts', name: 'T-shirts', description: 'Casual & moderne', href: '/category/clothes/t-shirts', icon: '👕' },
      { id: 'chemises', name: 'Chemises', description: 'Élégance décontractée', href: '/category/clothes/chemises', icon: '👔' },
      { id: 'hoodies-sweats', name: 'Hoodies & Sweats', description: 'Confort & style', href: '/category/clothes/hoodies-sweats', icon: '🧥' },
      { id: 'vestes', name: 'Vestes', description: 'Pour toutes les saisons', href: '/category/clothes/vestes', icon: '🧣' },
      { id: 'pantalons', name: 'Pantalons', description: 'Style & confort', href: '/category/clothes/pantalons', icon: '👖' },
      { id: 'jeans', name: 'Jeans', description: 'Classic & contemporain', href: '/category/clothes/jeans', icon: '🩳' },
      { id: 'shorts', name: 'Shorts', description: 'Pour l\'été', href: '/category/clothes/shorts', icon: '🩲' },
    ],
  },
  accessories: {
    nameEn: 'Accessories',
    nameFr: 'Accessoires',
    accentColor: '#00C896',
    featuredImage: 'https://res.cloudinary.com/doxg77zqk/image/upload/v1785165156/Move_accessories_up_2K_202607271606.jpg',
    subCategories: [
      { id: 'casquettes', name: 'Casquettes', description: 'Streetwear style', href: '/category/accessories/casquettes', icon: '🧢' },
      { id: 'sacs', name: 'Sacs', description: 'Pratique & tendance', href: '/category/accessories/sacs', icon: '👜' },
      { id: 'montres', name: 'Montres', description: 'Précision & élégance', href: '/category/accessories/montres', icon: '⌚' },
    ],
  },
};
