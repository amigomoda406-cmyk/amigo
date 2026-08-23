import StoreFooter from '@/components/layout/StoreFooter';
import Header from '@/components/layout/Header';

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col pt-32 pb-20 max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-black uppercase mb-8">Conditions Générales de Vente</h1>
        <div className="prose prose-zinc max-w-none">
          <p>Bienvenue sur Amigo Moda. Les présentes conditions de vente visent à définir les relations contractuelles entre Amigo Moda et l'acheteur...</p>
          {/* Add more terms here as needed */}
        </div>
      </main>
      <StoreFooter />
    </>
  );
}
