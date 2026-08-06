import { defineType, defineField } from 'sanity';

// ===== الألوان الـ 32 الجاهزة =====
const PRESET_COLORS = [
  { title: 'أبيض — White', value: '#FFFFFF' },
  { title: 'أسود — Black', value: '#000000' },
  { title: 'رمادي فاتح — Light Gray', value: '#D1D5DB' },
  { title: 'رمادي — Gray', value: '#6B7280' },
  { title: 'رمادي داكن — Dark Gray', value: '#374151' },
  { title: 'بيج — Beige', value: '#F5F0E8' },
  { title: 'كريمي — Cream', value: '#FFFDD0' },
  { title: 'بني فاتح — Light Brown', value: '#C4A882' },
  { title: 'بني — Brown', value: '#92400E' },
  { title: 'بني داكن — Dark Brown', value: '#451A03' },
  { title: 'أحمر — Red', value: '#EF4444' },
  { title: 'أحمر داكن — Dark Red', value: '#991B1B' },
  { title: 'وردي فاتح — Light Pink', value: '#FBCFE8' },
  { title: 'وردي — Pink', value: '#EC4899' },
  { title: 'فوشيا — Fuchsia', value: '#D946EF' },
  { title: 'برتقالي — Orange', value: '#F97316' },
  { title: 'برتقالي داكن — Dark Orange', value: '#EA580C' },
  { title: 'أصفر — Yellow', value: '#EAB308' },
  { title: 'ذهبي — Gold', value: '#D97706' },
  { title: 'أخضر فاتح — Light Green', value: '#86EFAC' },
  { title: 'أخضر — Green', value: '#22C55E' },
  { title: 'أخضر داكن — Dark Green', value: '#166534' },
  { title: 'زيتي — Olive', value: '#4D7C0F' },
  { title: 'أزرق سماوي — Sky Blue', value: '#7DD3FC' },
  { title: 'أزرق فاتح — Light Blue', value: '#60A5FA' },
  { title: 'أزرق — Blue', value: '#3B82F6' },
  { title: 'أزرق داكن — Dark Blue', value: '#1D4ED8' },
  { title: 'كحلي — Navy', value: '#1E3A5F' },
  { title: 'بنفسجي فاتح — Lavender', value: '#C4B5FD' },
  { title: 'بنفسجي — Purple', value: '#A855F7' },
  { title: 'بنفسجي داكن — Dark Purple', value: '#6B21A8' },
  { title: 'تركواز — Turquoise', value: '#14B8A6' },
];

// ===== المقاسات من 20 إلى 50 =====
const SHOE_SIZES = Array.from({ length: 31 }, (_, i) => {
  const size = 20 + i;
  return { title: `${size}`, value: `${size}` };
});

// مقاسات الملابس
const CLOTHING_SIZES = [
  { title: 'XS', value: 'XS' },
  { title: 'S', value: 'S' },
  { title: 'M', value: 'M' },
  { title: 'L', value: 'L' },
  { title: 'XL', value: 'XL' },
  { title: 'XXL', value: 'XXL' },
  { title: '3XL', value: '3XL' },
  { title: '4XL', value: '4XL' },
];

export const product = defineType({
  name: 'product',
  title: 'المنتجات (Products)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'اسم المنتج / Nom du produit',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (الرابط)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'السعر (دج) / Prix (DA)',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'comparePrice',
      title: 'السعر القديم (مشطوب) / Prix barré',
      type: 'number',
    }),
    defineField({
      name: 'inStock',
      title: 'متوفر في المخزن ؟',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'isNew',
      title: 'وصل حديثاً (جديد) ؟',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isTrending',
      title: 'رائج / الأكثر مبيعاً ؟',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'images',
      title: 'صور المنتج',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'description',
      title: 'الوصف / Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'parentCategory',
      title: 'القسم الأساسي',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subCategory',
      title: 'القسم الفرعي',
      type: 'reference',
      to: [{ type: 'subcategory' }],
    }),

    // ===== المقاسات =====
    defineField({
      name: 'sizeType',
      title: 'نوع المقاسات',
      type: 'string',
      options: {
        list: [
          { title: 'مقاسات أحذية (20–50)', value: 'shoes' },
          { title: 'مقاسات ملابس (XS–4XL)', value: 'clothing' },
          { title: 'بدون مقاسات', value: 'none' },
        ],
        layout: 'radio',
      },
      initialValue: 'none',
      description: 'اختر نوع المقاسات الخاصة بهذا المنتج',
    }),
    defineField({
      name: 'shoeSizes',
      title: 'مقاسات الأحذية (20–50)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'size',
              title: 'الرقم',
              type: 'string',
              options: { list: SHOE_SIZES },
            },
            {
              name: 'inStock',
              title: 'متوفر',
              type: 'boolean',
              initialValue: true,
            },
          ],
          preview: {
            select: { title: 'size', subtitle: 'inStock' },
            prepare({ title, subtitle }: any) {
              return {
                title: `مقاس ${title}`,
                subtitle: subtitle ? '✅ متوفر' : '❌ نفذ',
              };
            },
          },
        },
      ],
      hidden: ({ document }) => document?.sizeType !== 'shoes',
      description: 'أضف المقاسات المتوفرة من 20 إلى 50',
    }),
    defineField({
      name: 'clothingSizes',
      title: 'مقاسات الملابس',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'size',
              title: 'المقاس',
              type: 'string',
              options: { list: CLOTHING_SIZES },
            },
            {
              name: 'inStock',
              title: 'متوفر',
              type: 'boolean',
              initialValue: true,
            },
          ],
          preview: {
            select: { title: 'size', subtitle: 'inStock' },
            prepare({ title, subtitle }: any) {
              return {
                title: `مقاس ${title}`,
                subtitle: subtitle ? '✅ متوفر' : '❌ نفذ',
              };
            },
          },
        },
      ],
      hidden: ({ document }) => document?.sizeType !== 'clothing',
      description: 'أضف المقاسات المتوفرة XS / S / M / L / XL ...',
    }),

    // ===== الألوان الـ 32 =====
    defineField({
      name: 'colors',
      title: 'الألوان المتوفرة (32 لون)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'colorName',
              title: 'اسم اللون',
              type: 'string',
              options: {
                list: PRESET_COLORS,
              },
              description: 'اختر اللون من القائمة',
            },
            {
              name: 'inStock',
              title: 'هذا اللون متوفر ؟',
              type: 'boolean',
              initialValue: true,
            },
            {
              name: 'images',
              title: 'صور خاصة بهذا اللون (اختياري)',
              type: 'array',
              of: [{ type: 'image', options: { hotspot: true } }],
            },
          ],
          preview: {
            select: { title: 'colorName', subtitle: 'inStock' },
            prepare({ title, subtitle }: any) {
              const hex = PRESET_COLORS.find((c) => c.value === title)?.value || '';
              return {
                title: PRESET_COLORS.find((c) => c.value === title)?.title || title,
                subtitle: subtitle ? '✅ متوفر' : '❌ نفذ',
                media: hex
                  ? () => null
                  : undefined,
              };
            },
          },
        },
      ],
      description: 'اختر الألوان المتوفرة لهذا المنتج من قائمة 32 لون جاهزة',
    }),
  ],
});
