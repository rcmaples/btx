import {defineType} from 'sanity'

export const bundleSchema = defineType({
  name: 'bundle',
  title: 'Bundle',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Bundle Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(1).max(100),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().min(50).max(500),
    },
    {
      name: 'items',
      title: 'Bundle Items',
      type: 'array',
      of: [{type: 'bundleItem'}],
      description: 'Products and quantities included in this bundle',
      validation: (Rule) => Rule.required().min(2).max(10),
    },
    {
      name: 'price',
      title: 'Bundle Price',
      type: 'number',
      description: 'Price in USD cents (e.g., 4500 for $45.00)',
      validation: (Rule) => Rule.required().positive().integer(),
    },
    {
      name: 'savingsAmount',
      title: 'Savings Amount',
      type: 'number',
      description: 'Amount saved vs buying individually (USD cents)',
      validation: (Rule) => Rule.min(0).integer(),
    },
    {
      name: 'image',
      title: 'Bundle Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Bundle image (nullable, graceful fallback will be used)',
    },
    {
      name: 'isExclusiveDrop',
      title: 'Exchange Member Exclusive',
      type: 'boolean',
      description: 'Only visible to Exchange members',
      initialValue: false,
    },
    {
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Whether this bundle is currently available',
      initialValue: true,
    },
    {
      name: 'availableUntil',
      title: 'Available Until',
      type: 'datetime',
      description: 'Optional expiry date for limited-time bundles',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'price',
      media: 'image',
      isActive: 'isActive',
    },
    prepare({title, subtitle, media, isActive}) {
      return {
        title,
        subtitle: `$${(subtitle / 100).toFixed(2)} ${isActive ? '✓' : '✗ Inactive'}`,
        media,
      }
    },
  },
})
