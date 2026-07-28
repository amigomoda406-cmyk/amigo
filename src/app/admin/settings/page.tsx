import DeliverySettings from '@/components/admin/DeliverySettings';

export const metadata = {
  title: 'Paramètres de Livraison | Amigo Moda Admin',
};

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-black uppercase tracking-tighter text-zinc-900">Paramètres de Livraison</h1>
        <p className="text-sm font-medium text-zinc-500">Gérez les tarifs de livraison pour chaque wilaya (À Domicile et Bureau Yalidine).</p>
      </div>
      
      <DeliverySettings />
    </div>
  );
}
