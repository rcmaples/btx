import {Droplet} from 'lucide-react'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const processMethods = defineType({
  name: 'processMethods',
  title: 'Process Methods',
  type: 'document',
  icon: Droplet,
  __experimental_omnisearch_visibility: false,
  // liveEdit: true,
  fields: [
    defineField({
      name: 'methods',
      description: 'Coffee processing methods available for our products.',
      title: 'Methods',
      type: 'array',
      initialValue: [
        {
          title: 'Washed',
          value: 'washed',
          description:
            'Washed process produces clean, bright coffees with pronounced acidity and clarity',
        },
        {
          title: 'Natural',
          value: 'natural',
          description: 'Natural process yields fruity, winey coffees with full body and sweetness',
        },
        {
          title: 'Honey',
          value: 'honey',
          description: 'Honey process creates balanced coffees with enhanced sweetness and body',
        },
      ],
      of: [
        defineArrayMember({
          type: 'object',
          name: 'processMethod',
          title: 'Process Method',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              title: 'Display Name',
              description: 'The name shown to customers (e.g., "Washed", "Natural", "Honey")',
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
              description: 'Brief description of this processing method',
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
        title: 'Process Methods',
      }
    },
  },
})
