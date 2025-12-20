import type {ArrayOfPrimitivesInputProps, StringInputProps} from 'sanity'
import {defineType} from 'sanity'

import {DynamicArrayCheckboxInput} from '../../components/inputs/DynamicArrayCheckboxInput'
import {DynamicRadioInput} from '../../components/inputs/DynamicRadioInput'

export const productSchema = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fieldsets: [
    {
      name: 'coffeeDetails',
      title: 'Coffee Details',
      options: {
        columns: 2,
      },
    },
  ],
  fields: [
    {
      name: 'name',
      title: 'Product Name',
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
      name: 'isExclusiveDrop',
      title: 'Exchange Member Exclusive',
      type: 'boolean',
      description: 'Only visible to Exchange members',
      initialValue: false,
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Mark this product as featured',
      initialValue: false,
    },
    {
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                ],
              },
            ],
          },
        },
      ],
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'flavorProfile',
      title: 'Flavor Profile',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Tasting notes (e.g., Floral, Citrus, Berry)',
    },
    {
      name: 'origin',
      title: 'Origin',
      type: 'string',
      description: 'Country or region of origin',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'processMethod',
      title: 'Process Method',
      type: 'string',
      fieldset: 'coffeeDetails',
      description: 'Coffee processing method used',
      components: {
        input: (props: StringInputProps) =>
          DynamicRadioInput({
            ...props,
            query: '*[_type == "processMethods"][0].methods[]{"title": title, "value": value}',
          }),
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'roastLevel',
      title: 'Roast Level',
      type: 'string',
      fieldset: 'coffeeDetails',
      description: 'Select from available roast levels',
      components: {
        input: (props: StringInputProps) =>
          DynamicRadioInput({
            ...props,
            query: '*[_type == "roastLevels"][0].roastTypes[]{"title": title, "value": value}',
          }),
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'bestFor',
      title: 'Best For',
      type: 'array',
      fieldset: 'coffeeDetails',
      of: [{type: 'string'}],
      description: 'Types of coffee drinks this product is best suited for',
      components: {
        input: (props: ArrayOfPrimitivesInputProps) =>
          DynamicArrayCheckboxInput({
            ...props,
            query: '*[_type == "coffeeDrinks"][0].drinkTypes[]{"title": title, "value": value}',
          }),
      },
    },
    {
      name: 'productType',
      title: 'Product Type',
      type: 'string',
      fieldset: 'coffeeDetails',
      description: 'Type of coffee product',
      components: {
        input: (props: StringInputProps) =>
          DynamicRadioInput({
            ...props,
            query: '*[_type == "productTypes"][0].types[]{"title": title, "value": value}',
          }),
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'imageType',
              title: 'Image Type',
              type: 'string',
              description: 'Categorize this image for display purposes',
              options: {
                list: [
                  {title: 'Product Shot', value: 'product'},
                  {title: 'Lifestyle Shot', value: 'lifestyle'},
                ],
                layout: 'radio',
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'alt',
              title: 'Alternative Text',
              type: 'string',
              description: 'Describe the image for accessibility. Use AI Assist to auto-generate.',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'Optional caption for the image',
            },
          ],
        },
      ],
      description: 'Up to 3 product images: 2 product shots and 1 lifestyle shot (optional)',
      validation: (Rule) => Rule.max(3),
    },
    {
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'FAQ',
          fields: [
            {
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 3,
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              title: 'question',
              subtitle: 'answer',
            },
          },
        },
      ],
      validation: (Rule) => Rule.max(3),
      description: 'Add up to 3 frequently asked questions',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'origin',
      images: 'images',
    },
    prepare({title, subtitle, images}) {
      return {
        title,
        subtitle,
        media: images?.[0],
      }
    },
  },
})
