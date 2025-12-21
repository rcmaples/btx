import {defineType} from 'sanity'

export const customerSchema = defineType({
  name: 'customer',
  title: 'Customer',
  type: 'document',
  fields: [
    {
      name: 'supabaseId',
      title: 'Supabase User ID',
      type: 'string',
      description: 'Unique identifier from Supabase Auth',
      validation: (Rule) => Rule.required(),
      readOnly: true,
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
      readOnly: true,
    },
    {
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    },
    {
      name: 'address',
      title: 'Mailing Address',
      type: 'object',
      fields: [
        {
          name: 'street',
          title: 'Street Address',
          type: 'string',
        },
        {
          name: 'street2',
          title: 'Street Address Line 2',
          type: 'string',
          description: 'Apartment, suite, unit, etc.',
        },
        {
          name: 'city',
          title: 'City',
          type: 'string',
        },
        {
          name: 'state',
          title: 'State/Province',
          type: 'string',
        },
        {
          name: 'postalCode',
          title: 'Postal Code',
          type: 'string',
        },
        {
          name: 'country',
          title: 'Country',
          type: 'string',
          initialValue: 'US',
        },
      ],
    },
    {
      name: 'exchangeMembership',
      title: 'Exchange Membership',
      type: 'object',
      fields: [
        {
          name: 'isMember',
          title: 'Is Exchange Member',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'enrolledAt',
          title: 'Enrolled At',
          type: 'datetime',
          description: 'When the user first joined The Exchange',
        },
        {
          name: 'cancelledAt',
          title: 'Cancelled At',
          type: 'datetime',
          description: 'When the user cancelled their membership (if applicable)',
        },
      ],
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
    },
    {
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      readOnly: true,
    },
  ],
  preview: {
    select: {
      title: 'email',
      subtitle: 'phone',
      isMember: 'exchangeMembership.isMember',
    },
    prepare({title, subtitle, isMember}) {
      return {
        title,
        subtitle: isMember ? `${subtitle || ''} [Exchange Member]`.trim() : subtitle,
      }
    },
  },
})
