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

async function purge() {
  console.log('Fetching all custom documents...');
  // Fetch everything not starting with system prefix
  let docs = await client.fetch('*[!(_id in path("_.**")) && !(_id match "system.**")]');
  
  while(docs.length > 0) {
    console.log(`Found ${docs.length} documents. Attempting to delete...`);
    for (const doc of docs) {
      try {
        await client.delete(doc._id);
        console.log(`Deleted: ${doc._id}`);
      } catch (e) {
        // likely a reference error, skip for now and try again in next pass
      }
    }
    docs = await client.fetch('*[!(_id in path("_.**")) && !(_id match "system.**")]');
    if (docs.length === 0) break;
  }
  console.log('All custom data purged!');
}

purge().catch(console.error);
