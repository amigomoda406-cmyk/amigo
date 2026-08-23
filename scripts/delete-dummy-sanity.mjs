import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-02-08',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function deleteAll() {
  const typesToDelete = ['homePage', 'lookbook', 'product', 'subcategory', 'category'];
  
  for (const type of typesToDelete) {
    console.log(`Fetching ${type}s...`);
    const docs = await client.fetch(`*[_type == "${type}"]`);
    console.log(`Found ${docs.length} ${type}s. Deleting...`);
    for (const doc of docs) {
      await client.delete(doc._id);
      console.log(`Deleted ${doc._type}: ${doc._id}`);
    }
  }
  console.log('All dummy data deleted from Sanity!');
}

deleteAll().catch(console.error);
