import { defineType, defineField } from 'sanity';

export const homePage = defineType({
  name: 'homePage',
  title: 'Page d\'Accueil',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre de la page (Interne)',
      type: 'string',
      initialValue: 'Configuration de l\'Accueil',
      readOnly: true,
    }),
    defineField({
      name: 'heroBanners',
      title: 'Bannières Hero (Images principales)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'image', title: 'Image (Desktop)', type: 'image', options: { hotspot: true } },
            { name: 'mobileImage', title: 'Image (Mobile - Optionnel)', type: 'image', options: { hotspot: true } },
            { name: 'title', title: 'Titre', type: 'string' },
            { name: 'subtitle', title: 'Sous-titre', type: 'string' },
            { name: 'seasonColor', title: 'Couleur de Saison (Glow hex)', type: 'string', initialValue: '#C9A96E', description: 'Ex: #C9A96E (Or) ou #1E3A8A (Hiver)' },
            { name: 'buttonText', title: 'Texte du bouton', type: 'string', initialValue: 'Acheter maintenant' },
            { name: 'buttonLink', title: 'Lien du bouton', type: 'string', initialValue: '/' },
          ],
        },
      ],
      description: 'Ajoutez les images qui défilent tout en haut de la page.',
    }),
    defineField({
      name: 'featuredCategories',
      title: 'Catégories Mises en Avant (Dynamic Island / Accueil)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
      validation: (Rule) => Rule.max(3),
      description: 'Sélectionnez jusqu\'à 3 catégories qui apparaîtront dans la navigation rapide.',
    }),
  ],
});
