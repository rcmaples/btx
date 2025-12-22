import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'

import {ArticleBody} from '@/components/article/ArticleBody'
import {getReleaseNoteBySlug, getReleaseNotes} from '@/lib/services/sanity/queries'
import {formatDate} from '@/lib/utils/date'

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

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="mb-lg" aria-label="Breadcrumb">
        <ol className="flex items-center gap-sm text-sm">
          <li>
            <Link href="/" className="text-text-muted hover:text-text">
              Home
            </Link>
          </li>
          <li className="text-text-muted">/</li>
          <li>
            <Link href="/release-notes" className="text-text-muted hover:text-text">
              Release Notes
            </Link>
          </li>
          <li className="text-text-muted">/</li>
          <li className="text-text font-medium">{article.title}</li>
        </ol>
      </nav>

      {/* Article Header */}
      <header className="mb-xl">
        <h1 className="text-4xl font-black tracking-tighter mb-md">{article.title}</h1>
        <div className="flex items-center gap-md text-text-muted text-sm">
          {article.publishedAt && (
            <time dateTime={new Date(article.publishedAt).toISOString()}>
              {formatDate(article.publishedAt)}
            </time>
          )}
          {article.author && (
            <>
              <span>•</span>
              <span>{article.author}</span>
            </>
          )}
        </div>
      </header>

      {/* Article Body */}
      <article className="prose prose-lg max-w-none">
        {article.body ? (
          <ArticleBody body={article.body} />
        ) : (
          <p className="text-text-muted">No content available.</p>
        )}
      </article>

      {/* Featured Products */}
      {article.featuredProducts && article.featuredProducts.length > 0 && (
        <div className="mt-xxl pt-xl border-t border-border">
          <h2 className="text-2xl font-bold mb-lg">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
            {article.featuredProducts.map((product) => (
              <Link
                key={product._id}
                href={`/products/${product.slug}`}
                className="block p-md border-2 border-border hover:shadow-brutal transition-all"
              >
                <h3 className="font-bold mb-xs">{product.name}</h3>
                <p className="text-sm text-text-muted">
                  {product.origin} • {product.roastLevel}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back Link */}
      <div className="mt-xl">
        <Link
          href="/release-notes"
          className="text-primary hover:underline inline-flex items-center gap-xs"
        >
          ← Back to Release Notes
        </Link>
      </div>
    </div>
  )
}
