import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'li03k134',
  dataset: 'production',
  useCdn: false, // set to `false` to bypass the edge cache
  apiVersion: '2024-01-01', // use current date (YYYY-MM-DD) to target the latest API version
  token: 'skYd7DcvVUrG3JRy9lpNXLSFm7JT2axV4Nhr5l1tOzC6D9mtzcJKyjk5k9PjbjE8QR1fY5DXJNL3dfTrRScv3fTxWdok2smfRhi1d8nFv4xqr4gRUrOwvc9siWy7dFRPFd7eXSVnPy5itRyQ4W2FxzwF9KajJjfy6wmjUWnt3OdrkjmtO0o9' // Only if you want to update content with the client
});

async function main() {
  try {
    const doc = {
      _id: 'homePage',
      _type: 'homePage',
      title: 'Configuration de l\'Accueil',
    };
    
    // Create the document if it doesn't exist
    const res = await client.createIfNotExists(doc);
    console.log('Document created or already exists:', res._id);
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
