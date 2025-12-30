'use client'

import {ArticleCard} from '@/components/article/ArticleCard'
import {usePageName} from '@/lib/fullstory/hooks'
import type {Article} from '@/lib/types'

interface ReleaseNotesClientProps {
  articles: Article[]
}

export function ReleaseNotesClient({articles}: ReleaseNotesClientProps) {
  usePageName('Release Notes')

  return (
    <div>
      <header className="mb-xl">
        <h1 className="text-5xl font-black tracking-tighter mb-sm">Release Notes</h1>
        <p className="text-lg text-text-muted">
          Stay up to date with the latest updates and improvements
        </p>
      </header>

      <main>
        {articles.length === 0 ? (
          <div className="text-center py-xxl">
            <h2 className="text-2xl font-bold mb-md">No release notes yet</h2>
            <p className="text-text-muted">Check back soon for updates.</p>
          </div>
        ) : (
          <div className="space-y-lg">
            {articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
