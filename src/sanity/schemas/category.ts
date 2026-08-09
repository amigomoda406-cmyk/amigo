import { defineType, defineField } from 'sanity';
import { orderRankField } from '@sanity/orderable-document-list';

export const category = defineType({
  name: 'category',
  title: 'الأقسام الأساسية (Main Categories)',
  type: 'document',
  fields: [
    orderRankField({ type: 'category' }),
    defineField({
      name: 'title',
      title: 'Titre / العنوان',
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
      name: 'description',
      title: 'Description / الوصف',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'image',
      title: 'Image de la catégorie / صورة القسم',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
});
