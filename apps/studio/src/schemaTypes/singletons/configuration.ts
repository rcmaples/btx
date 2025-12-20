import {Settings} from 'lucide-react'
import {defineField, defineType} from 'sanity'

export const configuration = defineType({
  name: 'configuration',
  title: 'Configuration',
  type: 'document',
  icon: Settings,
  __experimental_omnisearch_visibility: false,
  fieldsets: [
    {
      name: 'products',
      title: 'Product Configuration',
      description: 'Product types available for coffee offerings',
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'processing',
      title: 'Processing & Roasting',
      description: 'Coffee processing methods and roast levels',
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'brewing',
      title: 'Brewing Options',
      description: 'Available coffee drinks and grind types',
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'packaging',
      title: 'Package Options',
      description: 'Available package sizes for coffee products',
      options: {collapsible: true, collapsed: false},
    },
  ],
  fields: [
    // Product Configuration
    defineField({
      name: 'productTypes',
      title: 'Product Types',
      description: 'Reference to product types configuration',
      type: 'reference',
      to: [{type: 'productTypes'}],
      fieldset: 'products',
      validation: (Rule) => Rule.required(),
    }),

    // Processing Methods
    defineField({
      name: 'processMethods',
      title: 'Process Methods',
      description: 'Reference to process methods configuration',
      type: 'reference',
      to: [{type: 'processMethods'}],
      fieldset: 'processing',
      validation: (Rule) => Rule.required(),
    }),

    // Roast Levels
    defineField({
      name: 'roastLevels',
      title: 'Roast Levels',
      description: 'Reference to roast levels configuration',
      type: 'reference',
      to: [{type: 'roastLevels'}],
      fieldset: 'processing',
      validation: (Rule) => Rule.required(),
    }),

    // Coffee Drinks
    defineField({
      name: 'coffeeDrinks',
      title: 'Coffee Drink Types',
      description: 'Reference to coffee drinks configuration',
      type: 'reference',
      to: [{type: 'coffeeDrinks'}],
      fieldset: 'brewing',
      validation: (Rule) => Rule.required(),
    }),

    // Grind Types
    defineField({
      name: 'grindTypes',
      title: 'Grind Options',
      description: 'Reference to grind types configuration',
      type: 'reference',
      to: [{type: 'grindTypes'}],
      fieldset: 'brewing',
      validation: (Rule) => Rule.required(),
    }),

    // Available Sizes
    defineField({
      name: 'availableSizes',
      title: 'Available Sizes',
      description: 'Reference to available sizes configuration',
      type: 'reference',
      to: [{type: 'availableSizes'}],
      fieldset: 'packaging',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Configuration',
        subtitle: 'Global site settings and options',
      }
    },
  },
})
