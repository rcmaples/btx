import {Settings} from 'lucide-react'
import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Main Configuration Dashboard
      S.listItem()
        .title('Configuration')
        .icon(Settings)
        .child(
          S.editor().id('configuration').schemaType('configuration').documentId('configuration'),
        ),

      S.divider(),

      S.divider(),

      // Regular documents
      S.documentTypeListItem('product').title('Products'),
      S.documentTypeListItem('bundle').title('Bundles'),
      S.documentTypeListItem('article').title('Articles'),
      S.documentTypeListItem('promotion').title('Promotions'),
    ])
