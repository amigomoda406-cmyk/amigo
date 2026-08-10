export default {
  name: 'lookbook',
  title: 'Lookbooks',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title (Admin Only)',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Lookbook Image',
      type: 'image',
      options: {
        hotspot: true, // Let Sanity handle basic cropping if needed
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'products',
      title: 'Products in this Look',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'hotspot',
          fields: [
            {
              name: 'product',
              title: 'Product',
              type: 'reference',
              to: [{ type: 'product' }],
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'x',
              title: 'X Coordinate (%)',
              description: 'Left position (0-100)',
              type: 'number',
              validation: (Rule: any) => Rule.required().min(0).max(100),
            },
            {
              name: 'y',
              title: 'Y Coordinate (%)',
              description: 'Top position (0-100)',
              type: 'number',
              validation: (Rule: any) => Rule.required().min(0).max(100),
            },
          ],
          preview: {
            select: {
              title: 'product.title',
              x: 'x',
              y: 'y'
            },
            prepare(selection: any) {
              const { title, x, y } = selection;
              return {
                title: title,
                subtitle: `X: ${x}%, Y: ${y}%`
              };
            }
          }
        },
      ],
    },
  ],
};
