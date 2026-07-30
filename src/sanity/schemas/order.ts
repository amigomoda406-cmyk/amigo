import { defineType, defineField } from 'sanity';

export const order = defineType({
  name: 'order',
  title: 'Commandes',
  type: 'document',
  fields: [
    defineField({
      name: 'orderNumber',
      title: 'Numéro de commande',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'customerName',
      title: 'Nom du client',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'customerPhone',
      title: 'Téléphone',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'wilaya',
      title: 'Wilaya',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'commune',
      title: 'Commune',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'totalAmount',
      title: 'Montant Total (DA)',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Statut de la commande',
      type: 'string',
      options: {
        list: [
          { title: 'En attente', value: 'pending' },
          { title: 'Confirmée', value: 'confirmed' },
          { title: 'Expédiée', value: 'shipped' },
          { title: 'Livrée', value: 'delivered' },
          { title: 'Annulée', value: 'cancelled' },
        ],
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'items',
      title: 'Produits',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'productName', title: 'Produit', type: 'string' },
            { name: 'quantity', title: 'Quantité', type: 'number' },
            { name: 'price', title: 'Prix Unitaire', type: 'number' },
            { name: 'selectedSize', title: 'Taille', type: 'string' },
            { name: 'selectedColor', title: 'Couleur', type: 'string' },
            {
              name: 'productRef',
              title: 'Lien Produit',
              type: 'reference',
              to: [{ type: 'product' }],
            },
          ],
          preview: {
            select: {
              title: 'productName',
              subtitle: 'quantity',
              description: 'selectedSize'
            },
            prepare(selection) {
              const { title, subtitle, description } = selection;
              return {
                title: title,
                subtitle: `Qté: ${subtitle} | Taille: ${description || 'N/A'}`
              }
            }
          }
        },
      ],
    }),
    defineField({
      name: 'createdAt',
      title: 'Date de création',
      type: 'datetime',
      initialValue: (new Date()).toISOString(),
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'customerName',
      subtitle: 'totalAmount',
      status: 'status',
      date: 'createdAt'
    },
    prepare({ title, subtitle, status, date }) {
      const formattedDate = date ? new Date(date).toLocaleDateString('fr-FR') : '';
      return {
        title: `${title} - ${subtitle} DA`,
        subtitle: `${status.toUpperCase()} | ${formattedDate}`,
      };
    },
  },
});
