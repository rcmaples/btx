import {defineType} from 'sanity'

export const bundleItemSchema = defineType({
  name: 'bundleItem',
  title: 'Bundle Item',
  type: 'object',
  fields: [
    {
      name: 'product',
      title: 'Product',
      type: 'reference',
      to: [{type: 'product'}],
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'quantity',
      title: 'Quantity',
      type: 'number',
      description: 'Number of units of this product in the bundle',
      validation: (Rule) => Rule.required().positive().integer().min(1).max(10),
      initialValue: 1,
    },
  ],
  preview: {
    select: {
      productName: 'product.name',
      productOrigin: 'product.origin',
      quantity: 'quantity',
      media: 'product.images.0',
    },
    prepare({productName, productOrigin, quantity, media}) {
      return {
        title: `${quantity}x ${productName || 'Untitled Product'}`,
        subtitle: productOrigin || '',
        media,
      }
    },
  },
})
