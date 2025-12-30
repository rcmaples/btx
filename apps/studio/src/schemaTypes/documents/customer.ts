import {defineType} from 'sanity'

export const customerSchema = defineType({
  name: 'customer',
  title: 'Customer',
  type: 'document',
  fields: [
    {
      name: 'clerkUserId',
      title: 'Clerk User ID',
      type: 'string',
      description: 'Unique identifier from Clerk Auth (format: user_xxx)',
      validation: (Rule) => Rule.required(),
      readOnly: true,
    },
    {
      name: 'firstName',
      title: 'First Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'lastName',
      title: 'Last Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
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
    {
      name: 'accountClosed',
      title: 'Account Closed',
      type: 'boolean',
      description: 'Whether the user has deleted their account',
      initialValue: false,
      readOnly: true,
    },
    {
      name: 'accountClosedAt',
      title: 'Account Closed At',
      type: 'datetime',
      description: 'When the user deleted their account',
      readOnly: true,
    },
  ],
  preview: {
    select: {
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email',
    },
    prepare({firstName, lastName, email}) {
      return {
        title: `${firstName} ${lastName}`,
        subtitle: email,
      }
    },
  },
})
