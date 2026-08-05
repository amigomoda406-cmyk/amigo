import { defineType, defineField } from 'sanity';
import { orderRankField } from '@sanity/orderable-document-list';

export const subcategory = defineType({
  name: 'subcategory',
  title: 'الأقسام الفرعية (Subcategories)',
  type: 'document',
  fields: [
    orderRankField({ type: 'subcategory' }),
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
      name: 'parentCategory',
      title: 'القسم الأساسي (Parent Category)',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
      description: 'اختر القسم الأساسي الذي يتبعه هذا القسم الفرعي (مثال: ملابس رجالية)',
    }),
    defineField({
      name: 'image',
      title: 'Image / صورة القسم الفرعي',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
});
