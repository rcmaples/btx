import {WeightTilde} from 'lucide-react'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const availableSizes = defineType({
  name: 'availableSizes',
  title: 'Available sizes',
  type: 'document',
  icon: WeightTilde,
  __experimental_omnisearch_visibility: false,
  fields: [
    defineField({
      name: 'sizeTypes',
      description: 'Sizes/quantity our coffee is available in.',
      title: 'Size',
      type: 'array',
      initialValue: [
        {
          name: '240g',
          grams: 240,
          ounces: 8,
          pounds: 0.5,
        },
        {
          name: '340g',
          grams: 340,
          ounces: 12,
          pounds: 0.75,
        },
        {
          name: '1lb',
          grams: 453.6,
          ounces: 16,
          pounds: 1,
        },
        {
          name: '2lb',
          grams: 907.2,
          ounces: 32,
          pounds: 0.5,
        },
      ],
      of: [
        defineArrayMember({
          type: 'object',
          name: 'size',
          title: 'Package size',
          fields: [
            defineField({
              name: 'name',
              type: 'string',
              title: 'Name',
            }),
            defineField({
              name: 'grams',
              type: 'number',
              title: 'Size in grams',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'ounces',
              type: 'number',
              title: 'Size in oz',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'pounds',
              type: 'number',
              title: 'Size in lbs',
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Size options',
      }
    },
  },
})
