import type {Metadata} from 'next'

import {getReleaseNotes} from '@/lib/services/sanity/queries'

import {ReleaseNotesClient} from './ReleaseNotesClient'

export const metadata: Metadata = {
  title: 'Release Notes',
  description: 'Stay up to date with the latest updates and improvements.',
}

export default async function ReleaseNotesPage() {
  const articles = await getReleaseNotes()

  return <ReleaseNotesClient articles={articles} />
}
