import { defineType, defineField } from 'sanity';

export const shippingSettings = defineType({
  name: 'shippingSettings',
  title: 'Prix de Livraison',
  type: 'document',
  fields: [
    defineField({
      name: 'wilaya',
      title: 'Wilaya',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'homeDeliveryPrice',
      title: 'Livraison à Domicile (DA)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'deskDeliveryPrice',
      title: 'Livraison au Bureau/Point Relais (DA)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
  ],
});
