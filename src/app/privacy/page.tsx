import StoreFooter from '@/components/layout/StoreFooter';
import Header from '@/components/layout/Header';

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col pt-32 pb-20 max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-black uppercase mb-8">Politique de Confidentialité</h1>
        <div className="prose prose-zinc max-w-none">
          <p>La protection de vos données personnelles est importante pour Amigo Moda. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations...</p>
          {/* Add more privacy terms here as needed */}
        </div>
      </main>
      <StoreFooter />
    </>
  );
}
