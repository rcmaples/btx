import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {getReleaseNoteBySlug, getReleaseNotes} from '@/lib/services/sanity/queries'

import {ReleaseNoteDetailClient} from './ReleaseNoteDetailClient'

interface ReleaseNotePageProps {
  params: Promise<{slug: string}>
}

export async function generateMetadata({params}: ReleaseNotePageProps): Promise<Metadata> {
  const {slug} = await params
  const article = await getReleaseNoteBySlug(slug)

  if (!article) {
    return {
      title: 'Release Note Not Found',
    }
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: `${article.title} | Batch Theory`,
      description: article.excerpt,
    },
  }
}

export async function generateStaticParams() {
  const articles = await getReleaseNotes()
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

export default async function ReleaseNoteDetailPage({params}: ReleaseNotePageProps) {
  const {slug} = await params
  const article = await getReleaseNoteBySlug(slug)

  if (!article) {
    notFound()
  }

  return <ReleaseNoteDetailClient article={article} />
}
