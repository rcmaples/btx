import {Fan} from 'lucide-react'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const grindTypes = defineType({
  name: 'grindTypes',
  title: 'Grind options',
  type: 'document',
  icon: Fan,
  __experimental_omnisearch_visibility: false,
  // liveEdit: true,
  fields: [
    defineField({
      name: 'grindOptions',
      description: 'A collection of available grind options.',
      title: 'Grind options',
      type: 'array',
      initialValue: ['Whole bean', 'Drip', 'Pour over', 'espresso'],
      of: [
        defineArrayMember({
          type: 'string',
          name: 'grindType',
          title: 'Grind type',
          validation: (Rule) =>
            Rule.required().custom((value) => {
              if (typeof value !== 'string') return true
              if (value.length === 0) return true

              // Check if first character is uppercase
              const firstChar = value.charAt(0)
              if (firstChar !== firstChar.toUpperCase()) {
                return 'First letter must be capitalized'
              }

              // Check if remaining characters are lowercase (only letters)
              const remaining = value.slice(1)
              for (let i = 0; i < remaining.length; i++) {
                const char = remaining.charAt(i)
                // Only check alphabetic characters
                if (/[A-Za-z]/.test(char) && char !== char.toLowerCase()) {
                  return 'Only the first letter should be capitalized'
                }
              }

              return true
            }),
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Available Grind Types',
      }
    },
  },
})
