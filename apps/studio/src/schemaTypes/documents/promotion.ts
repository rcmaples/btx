import {defineType} from 'sanity'

interface PromotionDocument {
  _type: 'promotion'
  type?: string
  code?: string
  name?: string
  discountType?: string
  discountValue?: number
  minimumPurchase?: number
  validFrom?: string
  validUntil?: string
  isActive?: boolean
}

export const promotionSchema = defineType({
  name: 'promotion',
  title: 'Promotion',
  type: 'document',
  // liveEdit: true,
  fields: [
    {
      name: 'code',
      title: 'Promo Code',
      type: 'string',
      description: 'Required for manual promos (e.g., DEMO10)',
      validation: (Rule) =>
        Rule.custom((code, context) => {
          const type = (context.document as PromotionDocument)?.type
          if (type === 'manual' && !code) {
            return 'Code is required for manual promotions'
          }
          return true
        }).uppercase(),
    },
    {
      name: 'name',
      title: 'Promotion Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          {title: 'Manual (Promo Code)', value: 'manual'},
          {title: 'Auto (Rule-based)', value: 'auto'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'discountType',
      title: 'Discount Type',
      type: 'string',
      options: {
        list: [
          {title: 'Percentage', value: 'percentage'},
          {title: 'Fixed Amount', value: 'fixed_amount'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'discountValue',
      title: 'Discount Value',
      type: 'number',
      description: 'Percentage (0-100) or amount in USD cents depending on discount type',
      validation: (Rule) => Rule.required().positive(),
    },
    {
      name: 'minimumPurchase',
      title: 'Minimum Purchase',
      type: 'number',
      description: 'Minimum cart subtotal for eligibility (USD cents)',
      validation: (Rule) => Rule.min(0).integer(),
    },
    {
      name: 'applicableProducts',
      title: 'Applicable Products',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'product'}]}],
      description:
        'Leave empty to apply to ALL products, or select specific products this promotion applies to',
    },
    {
      name: 'excludedProducts',
      title: 'Excluded Products',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'product'}]}],
      description: 'Products that are NOT eligible for this promotion',
    },
    {
      name: 'validFrom',
      title: 'Valid From',
      type: 'datetime',
      description: 'Start date (optional)',
    },
    {
      name: 'validUntil',
      title: 'Valid Until',
      type: 'datetime',
      description: 'Expiry date (optional)',
    },
    {
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Active status',
      initialValue: true,
    },
  ],
  preview: {
    select: {
      code: 'code',
      name: 'name',
      type: 'type',
      isActive: 'isActive',
    },
    prepare({code, name, type, isActive}) {
      return {
        title: code || name,
        subtitle: `${type} ${isActive ? '✓ Active' : '✗ Inactive'}`,
      }
    },
  },
})
