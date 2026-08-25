import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function main() {
  console.log('🌱 Starting Sanity Seed...');

  // 1. Create Main Categories
  const clothesCat = await client.createIfNotExists({
    _id: 'cat-clothes-seed',
    _type: 'category',
    title: 'Clothes',
    slug: { current: 'clothes', _type: 'slug' },
  });
  console.log('✅ Main Category: Clothes created');

  const shoesCat = await client.createIfNotExists({
    _id: 'cat-shoes-seed',
    _type: 'category',
    title: 'Shoes',
    slug: { current: 'shoes', _type: 'slug' },
  });
  console.log('✅ Main Category: Shoes created');

  const accCat = await client.createIfNotExists({
    _id: 'cat-acc-seed',
    _type: 'category',
    title: 'Accessories',
    slug: { current: 'accessories', _type: 'slug' },
  });
  console.log('✅ Main Category: Accessories created');

  // 2. Create Subcategory "Short" inside "Clothes"
  const shortSub = await client.createIfNotExists({
    _id: 'subcat-short-seed',
    _type: 'subcategory',
    title: 'Short',
    slug: { current: 'short', _type: 'slug' },
    parentCategory: { _type: 'reference', _ref: clothesCat._id }
  });
  console.log('✅ Subcategory: Short created');

  // 3. Create a Test Product linked to "Short"
  const testProduct = await client.createOrReplace({
    _id: 'product-test-short',
    _type: 'product',
    title: 'Premium Summer Short',
    slug: { current: 'premium-summer-short', _type: 'slug' },
    price: 3500,
    compareAtPrice: 5000,
    isNew: true, // "الجديد"
    isTrending: true, // "تريندينق"
    category: { _type: 'reference', _ref: clothesCat._id },
    subcategory: { _type: 'reference', _ref: shortSub._id },
    sizes: ['S', 'M', 'L', 'XL'],
    colorVariants: [
      {
        _key: 'variant-black',
        colorName: 'Black',
        colorHex: '#000000'
      },
      {
        _key: 'variant-beige',
        colorName: 'Beige',
        colorHex: '#F5F5DC'
      }
    ]
  });
  console.log('✅ Product: Premium Summer Short created with sizes and color variants');

  console.log('🎉 Seeding completed successfully!');
}

main().catch(console.error);
