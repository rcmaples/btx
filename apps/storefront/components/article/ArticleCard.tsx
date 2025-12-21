import Link from 'next/link'

import {urlFor} from '@/lib/sanity/image'
import {formatDate} from '@/lib/utils/date'
import type {Article} from '@/lib/types'

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({article}: ArticleCardProps) {
  const imageUrl = article.coverImage
    ? urlFor(article.coverImage).width(200).height(200).format('webp').url()
    : null

  return (
    <Link
      href={`/release-notes/${article.slug}`}
      className="flex gap-lg p-md border-2 border-border hover:shadow-brutal transition-all duration-fast no-underline group"
    >
      {imageUrl && (
        <div className="shrink-0 w-[120px] h-[120px] bg-background-alt overflow-hidden">
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold mb-xs text-text group-hover:underline line-clamp-2">
          {article.title}
        </h2>

        <div className="flex items-center gap-md text-sm text-text-muted mb-sm">
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

        {article.excerpt && (
          <p className="text-text-secondary text-sm line-clamp-2">{article.excerpt}</p>
        )}
      </div>
    </Link>
  )
}
