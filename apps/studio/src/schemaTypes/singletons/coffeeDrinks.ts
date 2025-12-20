import {Coffee} from 'lucide-react'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const coffeeDrinks = defineType({
  name: 'coffeeDrinks',
  title: 'Coffee Drinks',
  type: 'document',
  icon: Coffee,
  __experimental_omnisearch_visibility: false,
  // liveEdit: true,
  fields: [
    defineField({
      name: 'drinkTypes',
      description: 'Coffee drink types available for our products.',
      title: 'Drink Types',
      type: 'array',
      initialValue: [
        {
          title: 'Espresso',
          value: 'espresso',
          description: 'Best for espresso-based drinks',
        },
        {
          title: 'Milk Drinks',
          value: 'milk-drinks',
          description: 'Best for cappuccinos, lattes, and other milk-based drinks',
        },
        {
          title: 'Drip',
          value: 'drip',
          description: 'Best for drip coffee makers',
        },
        {
          title: 'Pour Over',
          value: 'pour-over',
          description: 'Best for pour over methods like V60 or Chemex',
        },
        {
          title: 'French Press',
          value: 'french-press',
          description: 'Best for French press brewing',
        },
      ],
      of: [
        defineArrayMember({
          type: 'object',
          name: 'drinkType',
          title: 'Drink Type',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              title: 'Display Name',
              description: 'The name shown to customers (e.g., "Espresso", "Milk Drinks")',
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
              description: 'Brief description of this drink type',
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
        title: 'Coffee Drink Types',
      }
    },
  },
})
