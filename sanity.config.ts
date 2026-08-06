import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { colorInput } from '@sanity/color-input';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import { schemaTypes } from './src/sanity/schemas';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'li03k134';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  name: 'AmigoModa_Studio',
  title: 'Amigo Moda Studio',

  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('المحتوى')
          .items([
            // الأقسام الأساسية مع ترتيب مخصص
            orderableDocumentListDeskItem({
              type: 'category',
              title: 'الأقسام الأساسية',
              icon: () => '📁',
              S,
              context,
            }),
            // الأقسام الفرعية مع ترتيب مخصص
            orderableDocumentListDeskItem({
              type: 'subcategory',
              title: 'الأقسام الفرعية',
              icon: () => '📂',
              S,
              context,
            }),
            S.divider(),
            // المنتجات
            S.listItem()
              .title('المنتجات')
              .icon(() => '🛍️')
              .child(
                S.documentTypeList('product')
                  .title('جميع المنتجات')
              ),
          ]),
    }),
    visionTool(),
    colorInput(),
  ],

  schema: {
    types: schemaTypes,
  },
});
