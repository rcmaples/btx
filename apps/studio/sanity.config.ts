import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {schemaTypes} from './src/schemaTypes'
import {structure} from './src/structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID!
const dataset = process.env.SANITY_STUDIO_DATASET!

export default defineConfig({
  name: 'btx',
  title: 'rcmaples',

  projectId,
  dataset,

  plugins: [
    structureTool({
      structure,
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev,
      // Main configuration singleton
      {
        id: 'configuration',
        title: 'Configuration',
        schemaType: 'configuration',
        value: {
          _id: 'configuration',
          _type: 'configuration',
          productTypes: {_type: 'reference', _ref: 'product-types'},
          processMethods: {_type: 'reference', _ref: 'process-methods'},
          roastLevels: {_type: 'reference', _ref: 'roast-levels'},
          coffeeDrinks: {_type: 'reference', _ref: 'coffee-drinks'},
          grindTypes: {_type: 'reference', _ref: 'grind-types'},
          availableSizes: {_type: 'reference', _ref: 'available-sizes'},
        },
      },
      // Domain singleton: Product Types
      {
        id: 'product-types',
        title: 'Product Types',
        schemaType: 'productTypes',
        value: {
          _id: 'product-types',
          _type: 'productTypes',
          types: [
            {
              _type: 'productType',
              title: 'Single-Origin',
              value: 'single-origin',
              description: 'Coffee from a single geographic region or farm',
            },
            {
              _type: 'productType',
              title: 'Blend',
              value: 'blend',
              description: 'A carefully crafted combination of coffee from multiple origins',
            },
            {
              _type: 'productType',
              title: 'Decaf',
              value: 'decaf',
              description: 'Decaffeinated coffee with all the flavor, none of the caffeine',
            },
          ],
        },
      },
      // Domain singleton: Process Methods
      {
        id: 'process-methods',
        title: 'Process Methods',
        schemaType: 'processMethods',
        value: {
          _id: 'process-methods',
          _type: 'processMethods',
          methods: [
            {
              _type: 'processMethod',
              title: 'Washed',
              value: 'washed',
              description:
                'Washed process produces clean, bright coffees with pronounced acidity and clarity',
            },
            {
              _type: 'processMethod',
              title: 'Natural',
              value: 'natural',
              description:
                'Natural process yields fruity, winey coffees with full body and sweetness',
            },
            {
              _type: 'processMethod',
              title: 'Honey',
              value: 'honey',
              description:
                'Honey process creates balanced coffees with enhanced sweetness and body',
            },
          ],
        },
      },
      // Domain singleton: Roast Levels
      {
        id: 'roast-levels',
        title: 'Roast Levels',
        schemaType: 'roastLevels',
        value: {
          _id: 'roast-levels',
          _type: 'roastLevels',
          roastTypes: [
            {
              _type: 'roastLevel',
              title: 'Light',
              value: 'light',
              description: 'Light roasts preserve the unique characteristics of the coffee origin',
            },
            {
              _type: 'roastLevel',
              title: 'Medium',
              value: 'medium',
              description: 'Medium roasts offer a balanced flavor profile',
            },
            {
              _type: 'roastLevel',
              title: 'Dark',
              value: 'dark',
              description: 'Dark roasts feature bold, rich flavors',
            },
          ],
        },
      },
      // Domain singleton: Coffee Drinks
      {
        id: 'coffee-drinks',
        title: 'Coffee Drinks',
        schemaType: 'coffeeDrinks',
        value: {
          _id: 'coffee-drinks',
          _type: 'coffeeDrinks',
          drinkType: ['Espresso', 'Milk drinks', 'Drip', 'Pour over', 'French press'],
        },
      },
      // Domain singleton: Grind Types
      {
        id: 'grind-types',
        title: 'Grind Types',
        schemaType: 'grindTypes',
        value: {
          _id: 'grind-types',
          _type: 'grindTypes',
          grindOptions: ['Whole bean', 'Drip', 'Pour over', 'Espresso'],
        },
      },
      // Domain singleton: Available Sizes
      {
        id: 'available-sizes',
        title: 'Available Sizes',
        schemaType: 'availableSizes',
        value: {
          _id: 'available-sizes',
          _type: 'availableSizes',
          sizeTypes: [
            {
              _type: 'size',
              name: '240g',
              grams: 240,
              ounces: 8,
              pounds: 0.5,
            },
            {
              _type: 'size',
              name: '340g',
              grams: 340,
              ounces: 12,
              pounds: 0.75,
            },
            {
              _type: 'size',
              name: '1lb',
              grams: 453.6,
              ounces: 16,
              pounds: 1,
            },
            {
              _type: 'size',
              name: '2lb',
              grams: 907.2,
              ounces: 32,
              pounds: 2,
            },
          ],
        },
      },
    ],
  },
})
