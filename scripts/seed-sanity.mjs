import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function main() {
  console.log('Clearing existing categories and products...');
  await client.delete({ query: '*[_type in ["product", "category"]]' });
  console.log('Cleared.');

  console.log('Creating Categories...');
  
  const clothingCategory = await client.create({
    _type: 'category',
    title: 'Vêtements',
    slug: { _type: 'slug', current: 'clothes' }
  });

  const shoesCategory = await client.create({
    _type: 'category',
    title: 'Shoes',
    slug: { _type: 'slug', current: 'shoes' }
  });

  const accessoriesCategory = await client.create({
    _type: 'category',
    title: 'Accessories',
    slug: { _type: 'slug', current: 'accessories' }
  });

  console.log('Categories created!');

  console.log('Uploading Images & Creating Products...');

  // Helper to upload image from URL
  async function uploadImage(url) {
    console.log(`Uploading ${url}...`);
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename: 'image.jpg',
    });
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      }
    };
  }

  // 1. Sneaker
  const sneakerImage = await uploadImage('https://res.cloudinary.com/doxg77zqk/image/upload/v1785165180/%D8%BA%D9%8A%D8%B1_%D8%A7%D9%84%D9%83%D9%84%D8%A7%D9%85_%D8%A7%D9%84%D9%85%D9%88%D8%AC%D9%88%D8%AF_%D9%88%D8%B1%D8%A7_%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC_202607271601.jpg');
  
  await client.create({
    _type: 'product',
    title: 'Urban Sneaker',
    slug: { _type: 'slug', current: 'urban-sneaker' },
    price: 4500,
    comparePrice: 5900,
    description: 'Une sneaker au style urbain, parfaite pour le quotidien.',
    inStock: true,
    isTrending: true,
    isNew: true,
    parentCategory: { _type: 'reference', _ref: shoesCategory._id },
    sizes: [
      { label: '40', inStock: true },
      { label: '41', inStock: true },
      { label: '42', inStock: true },
      { label: '43', inStock: false },
    ],
    colors: [
      { name: 'Noir', hex: '#000000' },
      { name: 'Blanc', hex: '#ffffff' },
    ],
    images: [sneakerImage]
  });

  // 2. Hoodie
  const hoodieImage = await uploadImage('https://res.cloudinary.com/doxg77zqk/image/upload/v1785165210/Change_writing_to_hoodie_2K_202607271601.jpg');
  
  await client.create({
    _type: 'product',
    title: 'Classic Hoodie',
    slug: { _type: 'slug', current: 'classic-hoodie' },
    price: 3200,
    description: 'Confort absolu avec ce hoodie minimaliste.',
    inStock: true,
    isTrending: true,
    parentCategory: { _type: 'reference', _ref: clothingCategory._id },
    sizes: [
      { label: 'S', inStock: true },
      { label: 'M', inStock: true },
      { label: 'L', inStock: true },
      { label: 'XL', inStock: true },
    ],
    colors: [
      { name: 'Gris', hex: '#808080' },
      { name: 'Noir', hex: '#000000' },
    ],
    images: [hoodieImage]
  });

  // 3. Accessory
  const accImage = await uploadImage('https://res.cloudinary.com/doxg77zqk/image/upload/v1785165156/Move_accessories_up_2K_202607271606.jpg');
  
  await client.create({
    _type: 'product',
    title: 'Street Watch',
    slug: { _type: 'slug', current: 'street-watch' },
    price: 2500,
    comparePrice: 3000,
    description: 'Montre élégante et résistante.',
    inStock: true,
    isNew: true,
    parentCategory: { _type: 'reference', _ref: accessoriesCategory._id },
    sizes: [{ label: 'Standard', inStock: true }],
    images: [accImage]
  });

  // 4. Random Product
  const bagImage = await uploadImage('https://res.cloudinary.com/doxg77zqk/image/upload/v1785160624/Remove_basket_increase_quality_2K_202607271454.jpg');
  
  await client.create({
    _type: 'product',
    title: 'Tech Backpack',
    slug: { _type: 'slug', current: 'tech-backpack' },
    price: 5200,
    description: 'Sac à dos imperméable pour tous vos déplacements.',
    inStock: true,
    parentCategory: { _type: 'reference', _ref: accessoriesCategory._id },
    sizes: [{ label: 'Standard', inStock: true }],
    colors: [{ name: 'Noir', hex: '#000000' }],
    images: [bagImage]
  });

  console.log('All fake data seeded successfully!');
}

main().catch(console.error);
