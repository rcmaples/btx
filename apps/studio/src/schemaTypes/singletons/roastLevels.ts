import {Flame} from 'lucide-react'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const roastLevels = defineType({
  name: 'roastLevels',
  title: 'Roast Levels',
  type: 'document',
  icon: Flame,
  __experimental_omnisearch_visibility: false,
  fields: [
    defineField({
      name: 'roastTypes',
      description: 'Roast levels available for our coffee.',
      title: 'Roast Levels',
      type: 'array',
      initialValue: [
        {
          title: 'Light',
          type: 'string',
          value: 'light',
          description: 'Light roasts preserve the unique characteristics of the coffee origin',
        },
        {
          title: 'Medium',
          type: 'string',
          value: 'medium',
          description: 'Medium roasts offer a balanced flavor profile',
        },
        {
          title: 'Dark',
          type: 'string',
          value: 'dark',
          description: 'Dark roasts feature bold, rich flavors',
        },
      ],
      of: [
        defineArrayMember({
          type: 'object',
          name: 'roastLevel',
          title: 'Roast Level',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              title: 'Display Name',
              description: 'The name shown to customers (e.g., "Light", "Medium", "Dark")',
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
              description: 'Brief description of this roast level',
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
        title: 'Roast Levels',
      }
    },
  },
})
