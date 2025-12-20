import {Flower} from 'lucide-react'
// import {Sprout} from 'lucide-react'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const productTypes = defineType({
  name: 'productTypes',
  title: 'Product Types',
  type: 'document',
  icon: Flower,
  __experimental_omnisearch_visibility: false,
  // liveEdit: true,
  fields: [
    defineField({
      name: 'types',
      description: 'Product types available for our coffee offerings.',
      title: 'Types',
      type: 'array',
      initialValue: [
        {
          title: 'Single-Origin',
          type: 'string',
          value: 'single-origin',
          description: 'Coffee from a single geographic region or farm',
        },
        {
          title: 'Blend',
          type: 'string',
          value: 'blend',
          description: 'A carefully crafted combination of coffee from multiple origins',
        },
        {
          title: 'Decaf',
          type: 'string',
          value: 'decaf',
          description: 'Decaffeinated coffee with all the flavor, none of the caffeine',
        },
      ],
      of: [
        defineArrayMember({
          type: 'object',
          name: 'productType',
          title: 'Product Type',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              title: 'Display Name',
              description: 'The name shown to customers (e.g., "Single-Origin", "Blend")',
              validation: (Rule) => Rule.required().min(1).max(50),
            }),
            defineField({
              name: 'value',
              type: 'string',
              title: 'Value',
              description: 'Internal identifier (lowercase, no spaces)',
              validation: (Rule) =>
                Rule.required().custom((value) => {
                  if (!value) return 'Value is required'
                  if (!/^[a-z0-9-]+$/.test(value)) {
                    return 'Value must be lowercase letters, numbers, and hyphens only'
                  }
                  return true
                }),
            }),
            defineField({
              name: 'description',
              type: 'text',
              title: 'Description',
              description: 'Brief description of this product type',
              rows: 2,
              validation: (Rule) => Rule.max(200),
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'value',
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Product Types',
      }
    },
  },
})
