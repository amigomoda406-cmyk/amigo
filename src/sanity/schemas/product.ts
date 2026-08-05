import { defineType, defineField } from 'sanity';

export const product = defineType({
  name: 'product',
  title: 'المنتجات (Products)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nom du produit',
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
      name: 'price',
      title: 'Prix (DA)',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'comparePrice',
      title: 'Prix barré (Ancien prix)',
      type: 'number',
    }),
    defineField({
      name: 'inStock',
      title: 'En stock ?',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'isNew',
      title: 'Nouveauté ?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isTrending',
      title: 'Tendance (Populaire) ?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'images',
      title: 'Images du produit',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'parentCategory',
      title: 'القسم الأساسي (Main Category)',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subCategory',
      title: 'القسم الفرعي (Subcategory)',
      type: 'reference',
      to: [{ type: 'subcategory' }],
    }),
    defineField({
      name: 'sizes',
      title: 'Pointures / Tailles',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Taille (ex: 42, XL)', type: 'string' },
            { name: 'inStock', title: 'En stock', type: 'boolean', initialValue: true },
          ],
        },
      ],
    }),
    defineField({
      name: 'colors',
      title: 'Couleurs',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', title: 'Nom (ex: Noir)', type: 'string' },
            { name: 'hex', title: 'Code couleur (ex: #000000)', type: 'color' },
          ],
        },
      ],
    }),
  ],
});
