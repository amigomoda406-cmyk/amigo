// src/types/product.ts

export interface SanityImage {
  asset: {
    url: string;
    metadata: {
      lqip?: string;
      dimensions?: { width: number; height: number };
    };
  };
  alt?: string;
}

export interface ProductSize {
  label: string;
  inStock: boolean;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductListItem {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  comparePrice?: number;
  inStock: boolean;
  isNew: boolean;
  isTrending: boolean;
  isFeatured?: boolean;
  images?: SanityImage[];
  sizes?: ProductSize[];
  colors?: ProductColor[];
  subCategory?: {
    title: string;
    slug: { current: string };
  };
  parentCategory?: {
    title: string;
    slug: { current: string };
  };
}

export interface ProductDetail extends ProductListItem {
  description?: any[]; // Portable Text
  related?: ProductListItem[];
  _updatedAt: string;
}
