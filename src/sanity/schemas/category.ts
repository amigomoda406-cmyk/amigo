import { defineType, defineField } from 'sanity';

export const category = defineType({
  name: 'category',
  title: 'Catégories',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (Lien)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'parent',
      title: 'Catégorie Parente',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'Laissez vide si c\'est une catégorie principale (ex: Homme). Sélectionnez une catégorie si c\'est une sous-catégorie (ex: T-shirts).',
    }),
    defineField({
      name: 'image',
      title: 'Image de la catégorie',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
});
