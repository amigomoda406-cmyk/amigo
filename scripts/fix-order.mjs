import { createClient } from '@sanity/client';
import { lexicalRank } from '@sanity/orderable-document-list';

const client = createClient({
  projectId: 'li03k134',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN || 'skYd7DcvVUrG3JRy9lpNXLSFm7JT2axV4Nhr5l1tOzC6D9mtzcJKyjk5k9PjbjE8QR1fY5DXJNL3dfTrRScv3fTxWdok2smfRhi1d8nFv4xqr4gRUrOwvc9siWy7dFRPFd7eXSVnPy5itRyQ4W2FxzwF9KajJjfy6wmjUWnt3OdrkjmtO0o9'
});

async function fixOrder(type) {
  const docs = await client.fetch(`*[_type == "${type}" && !defined(orderRank)]`);
  console.log(`Found ${docs.length} ${type} documents without orderRank`);
  
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    // To generate a rank, we can just use the index, or let Sanity Studio handle it. 
    // Actually, @sanity/orderable-document-list provides a helper or we can just set an arbitrary string for now, but lexicalRank is better.
    // However, generating lexicalRank manually without the helper might be tricky.
    // Let's use a simple approach: if we just assign a valid string, or we can just fetch all and re-rank them.
    // A simpler way: just patching it with a random orderRank might break the plugin if it's not a valid LexicalRank.
    // We can just use the orderable-document-list's method, but we don't have it exposed easily in a node script.
  }
}

async function main() {
  console.log('Use Sanity CLI or just explain to user');
}

main();
