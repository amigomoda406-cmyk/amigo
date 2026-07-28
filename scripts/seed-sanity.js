// scripts/seed-sanity.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function main() {
  console.log('🚀 Seeding Sanity DB...');

  // 1. Create Main Categories
  const mainCategories = [
    { _id: 'cat-clothes', _type: 'category', title: 'Vêtements', slug: { current: 'clothes' } },
    { _id: 'cat-shoes', _type: 'category', title: 'Chaussures', slug: { current: 'shoes' } },
    { _id: 'cat-accessories', _type: 'category', title: 'Accessoires', slug: { current: 'accessories' } },
  ];

  for (const cat of mainCategories) {
    await client.createOrReplace(cat);
    console.log(`✅ Created main category: ${cat.title}`);
  }

  // 2. Create Sub Categories
  const subCategories = [
    { _id: 'sub-tshirts', _type: 'category', title: 'T-shirts', slug: { current: 't-shirts' }, parent: { _type: 'reference', _ref: 'cat-clothes' } },
    { _id: 'sub-chemises', _type: 'category', title: 'Chemises', slug: { current: 'chemises' }, parent: { _type: 'reference', _ref: 'cat-clothes' } },
    { _id: 'sub-hoodies', _type: 'category', title: 'Hoodies & Sweats', slug: { current: 'hoodies-sweats' }, parent: { _type: 'reference', _ref: 'cat-clothes' } },
    { _id: 'sub-vestes', _type: 'category', title: 'Vestes', slug: { current: 'vestes' }, parent: { _type: 'reference', _ref: 'cat-clothes' } },
    { _id: 'sub-pantalons', _type: 'category', title: 'Pantalons', slug: { current: 'pantalons' }, parent: { _type: 'reference', _ref: 'cat-clothes' } },
    { _id: 'sub-jeans', _type: 'category', title: 'Jeans', slug: { current: 'jeans' }, parent: { _type: 'reference', _ref: 'cat-clothes' } },
    { _id: 'sub-shorts', _type: 'category', title: 'Shorts', slug: { current: 'shorts' }, parent: { _type: 'reference', _ref: 'cat-clothes' } },

    { _id: 'sub-sneakers', _type: 'category', title: 'Sneakers', slug: { current: 'sneakers' }, parent: { _type: 'reference', _ref: 'cat-shoes' } },
    { _id: 'sub-shoes-casual', _type: 'category', title: 'Chaussures décontractées', slug: { current: 'chaussures-decontractees' }, parent: { _type: 'reference', _ref: 'cat-shoes' } },
    { _id: 'sub-shoes-sport', _type: 'category', title: 'Chaussures de sport', slug: { current: 'chaussures-sport' }, parent: { _type: 'reference', _ref: 'cat-shoes' } },

    { _id: 'sub-casquettes', _type: 'category', title: 'Casquettes', slug: { current: 'casquettes' }, parent: { _type: 'reference', _ref: 'cat-accessories' } },
    { _id: 'sub-sacs', _type: 'category', title: 'Sacs', slug: { current: 'sacs' }, parent: { _type: 'reference', _ref: 'cat-accessories' } },
    { _id: 'sub-montres', _type: 'category', title: 'Montres', slug: { current: 'montres' }, parent: { _type: 'reference', _ref: 'cat-accessories' } },
  ];

  for (const sub of subCategories) {
    await client.createOrReplace(sub);
    console.log(`✅ Created sub-category: ${sub.title}`);
  }

  // 3. Create Dummy Products
  const products = [
    {
      _type: 'product',
      title: 'Sneakers Urban Pro',
      slug: { current: 'sneakers-urban-pro' },
      price: 5900,
      comparePrice: 7900,
      inStock: true,
      isNew: true,
      isTrending: true,
      parentCategory: { _type: 'reference', _ref: 'cat-shoes' },
      subCategory: { _type: 'reference', _ref: 'sub-sneakers' },
      sizes: [
        { _key: '1', label: '41', inStock: true },
        { _key: '2', label: '42', inStock: true },
        { _key: '3', label: '43', inStock: false },
      ],
      colors: [
        { _key: '1', name: 'Noir', hex: '#000000' },
        { _key: '2', name: 'Blanc', hex: '#FFFFFF' }
      ]
    },
    {
      _type: 'product',
      title: 'Hoodie Essential Noir',
      slug: { current: 'hoodie-essential-noir' },
      price: 4500,
      inStock: true,
      isNew: false,
      isTrending: true,
      parentCategory: { _type: 'reference', _ref: 'cat-clothes' },
      subCategory: { _type: 'reference', _ref: 'sub-hoodies' },
      sizes: [
        { _key: '1', label: 'M', inStock: true },
        { _key: '2', label: 'L', inStock: true },
        { _key: '3', label: 'XL', inStock: true },
      ],
    },
    {
      _type: 'product',
      title: 'Casquette Classic',
      slug: { current: 'casquette-classic' },
      price: 1500,
      inStock: true,
      isNew: true,
      isTrending: true,
      parentCategory: { _type: 'reference', _ref: 'cat-accessories' },
      subCategory: { _type: 'reference', _ref: 'sub-casquettes' },
    },
    {
      _type: 'product',
      title: 'Pantalon Cargo Beige',
      slug: { current: 'pantalon-cargo-beige' },
      price: 3800,
      inStock: true,
      isNew: true,
      isTrending: false,
      parentCategory: { _type: 'reference', _ref: 'cat-clothes' },
      subCategory: { _type: 'reference', _ref: 'sub-pantalons' },
    }
  ];

  for (const prod of products) {
    const created = await client.create(prod);
    console.log(`✅ Created product: ${prod.title} (${created._id})`);
  }

  console.log('🎉 Seeding Complete!');
}

main().catch(err => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
