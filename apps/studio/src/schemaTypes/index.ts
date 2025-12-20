import {type SchemaTypeDefinition} from 'sanity'

import {documentSchemaTypes} from './documents'
import {bundleItemSchema} from './objects'
import {singletonSchemaTypes} from './singletons'

export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons
  ...singletonSchemaTypes,
  // Documents
  ...documentSchemaTypes,
  // Objects
  bundleItemSchema,
]
