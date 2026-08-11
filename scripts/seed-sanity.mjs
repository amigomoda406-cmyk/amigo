// scripts/seed-sanity.mjs
// يرفع الأقسام الأساسية، الأقسام الفرعية، وصورة الهيرو سكشن إلى Sanity
// تشغيله مرة واحدة فقط: node scripts/seed-sanity.mjs

import { createClient } from '@sanity/client';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function uploadImageFromUrl(imageUrl, filename) {
  console.log(`📸 Uploading image from: ${imageUrl}`);
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const buffer = await response.buffer();
    const asset = await client.assets.upload('image', buffer, {
      filename: filename || 'image.jpg',
      contentType: response.headers.get('content-type') || 'image/jpeg',
    });
    console.log(`✅ Uploaded: ${asset._id}`);
    return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
  } catch (err) {
    console.warn(`⚠️  Could not upload ${imageUrl}: ${err.message}`);
    return null;
  }
}

async function uploadLocalImage(filePath, filename) {
  try {
    if (!existsSync(filePath)) {
      console.warn(`⚠️  Local file not found: ${filePath}`);
      return null;
    }
    console.log(`📸 Uploading local image: ${filePath}`);
    const buffer = readFileSync(filePath);
    const ext = filePath.split('.').pop().toLowerCase();
    const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
    const asset = await client.assets.upload('image', buffer, {
      filename: filename || filePath.split('/').pop(),
      contentType: mimeMap[ext] || 'image/jpeg',
    });
    console.log(`✅ Uploaded: ${asset._id}`);
    return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
  } catch (err) {
    console.warn(`⚠️  Could not upload local ${filePath}: ${err.message}`);
    return null;
  }
}

const CATEGORIES = [
  {
    title: 'Vêtements',
    slug: 'clothes',
    description: 'T-shirts, chemises, hoodies, pantalons et plus encore.',
    imageUrl: 'https://res.cloudinary.com/doxg77zqk/image/upload/v1785165210/Change_writing_to_hoodie_2K_202607271601.jpg',
    subcategories: [
      { title: 'T-shirts', slug: 't-shirts' },
      { title: 'Chemises', slug: 'chemises' },
      { title: 'Hoodies & Sweats', slug: 'hoodies-sweats' },
      { title: 'Vestes', slug: 'vestes' },
      { title: 'Pantalons', slug: 'pantalons' },
      { title: 'Jeans', slug: 'jeans' },
      { title: 'Shorts', slug: 'shorts' },
    ],
  },
  {
    title: 'Chaussures',
    slug: 'shoes',
    description: 'Sneakers, chaussures de sport et chaussures décontractées.',
    imageUrl: 'https://res.cloudinary.com/doxg77zqk/image/upload/v1785165180/%D8%BA%D9%8A%D8%B1_%D8%A7%D9%84%D9%83%D9%84%D8%A7%D9%85_%D8%A7%D9%84%D9%85%D9%88%D8%AC%D9%88%D8%AF_%D9%88%D8%B1%D8%A7_%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC_202607271601.jpg',
    subcategories: [
      { title: 'Sneakers', slug: 'sneakers' },
      { title: 'Chaussures décontractées', slug: 'chaussures-decontractees' },
      { title: 'Chaussures de sport', slug: 'chaussures-sport' },
    ],
  },
  {
    title: 'Accessoires',
    slug: 'accessories',
    description: 'Casquettes, sacs, montres et autres accessoires de mode.',
    imageUrl: 'https://res.cloudinary.com/doxg77zqk/image/upload/v1785165156/Move_accessories_up_2K_202607271606.jpg',
    subcategories: [
      { title: 'Casquettes', slug: 'casquettes' },
      { title: 'Sacs', slug: 'sacs' },
      { title: 'Montres', slug: 'montres' },
    ],
  },
];

async function main() {
  console.log('\n🚀 Starting Sanity seed...\n');

  const categoryIds = {};
  for (const cat of CATEGORIES) {
    const existing = await client.fetch(
      `*[_type == "category" && slug.current == $slug][0]._id`,
      { slug: cat.slug }
    );

    const imageAsset = await uploadImageFromUrl(cat.imageUrl, `${cat.slug}.jpg`);

    const catDoc = {
      _type: 'category',
      title: cat.title,
      slug: { _type: 'slug', current: cat.slug },
      description: cat.description,
      ...(imageAsset ? { image: imageAsset } : {}),
    };

    let catId;
    if (existing) {
      console.log(`📂 Updating existing category: ${cat.title}`);
      await client.patch(existing).set(catDoc).commit();
      catId = existing;
    } else {
      console.log(`📂 Creating category: ${cat.title}`);
      const created = await client.create(catDoc);
      catId = created._id;
    }
    categoryIds[cat.slug] = catId;
    console.log(`   → Category ID: ${catId}\n`);
  }

  console.log('\n📁 Creating subcategories...\n');
  for (const cat of CATEGORIES) {
    const parentId = categoryIds[cat.slug];
    for (const sub of cat.subcategories) {
      const existing = await client.fetch(
        `*[_type == "subcategory" && slug.current == $slug][0]._id`,
        { slug: sub.slug }
      );

      const subDoc = {
        _type: 'subcategory',
        title: sub.title,
        slug: { _type: 'slug', current: sub.slug },
        parentCategory: { _type: 'reference', _ref: parentId },
      };

      if (existing) {
        console.log(`  📄 Updating subcategory: ${sub.title}`);
        await client.patch(existing).set(subDoc).commit();
      } else {
        console.log(`  📄 Creating subcategory: ${sub.title}`);
        await client.create(subDoc);
      }
    }
  }

  console.log('\n🏠 Setting up Home Page...\n');
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const heroLocalPath = join(__dirname, '..', 'public', 'hero-custom.jpeg');
  
  let heroImage = await uploadLocalImage(heroLocalPath, 'hero-custom.jpeg');
  
  if (!heroImage) {
    console.log('Trying hero from Cloudinary fallback...');
    heroImage = await uploadImageFromUrl(
      'https://res.cloudinary.com/doxg77zqk/image/upload/v1785165210/Change_writing_to_hoodie_2K_202607271601.jpg',
      'hero-main.jpg'
    );
  }

  const existingHomePage = await client.fetch(`*[_type == "homePage"][0]._id`);

  const heroBannerDoc = {
    _key: 'banner-main',
    title: 'STYLE',
    subtitle: 'NEW COLLECTION',
    buttonText: 'Acheter maintenant',
    buttonLink: '/#categories',
    seasonColor: '#C9A96E',
    ...(heroImage ? { image: heroImage } : {}),
  };

  const homePageDoc = {
    _type: 'homePage',
    title: "Configuration de l'Accueil",
    heroBanners: [heroBannerDoc],
    featuredCategories: Object.values(categoryIds).map(id => ({
      _type: 'reference',
      _ref: id,
    })),
  };

  if (existingHomePage) {
    console.log('🏠 Updating existing homePage document...');
    await client.patch(existingHomePage).set(homePageDoc).commit();
    console.log(`✅ Home Page updated: ${existingHomePage}`);
  } else {
    console.log('🏠 Creating new homePage document...');
    const created = await client.create(homePageDoc);
    console.log(`✅ Home Page created: ${created._id}`);
  }

  console.log('\n✨ Sanity seed completed successfully!\n');
  console.log('Categories created:', Object.keys(categoryIds).join(', '));
}

main().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
