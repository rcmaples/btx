import type {PortableTextBlock} from '@portabletext/types'
import Image from 'next/image'
import {PortableText, type PortableTextComponents} from 'next-sanity'

import {urlFor} from '@/lib/sanity/image'

interface ArticleBodyProps {
  body: PortableTextBlock[]
}

const components: PortableTextComponents = {
  types: {
    image: ({value}) => {
      if (!value?.asset?._ref) {
        return null
      }
      return (
        <figure className="my-lg">
          <Image
            src={urlFor(value).width(800).format('webp').url()}
            alt={value.alt || ''}
            width={800}
            height={600}
            className="w-full rounded-sm"
            unoptimized
          />
          {value.caption && (
            <figcaption className="text-sm text-text-muted mt-sm text-center">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  marks: {
    link: ({children, value}) => {
      const rel = !value.href.startsWith('/') ? 'noopener noreferrer' : undefined
      const target = !value.href.startsWith('/') ? '_blank' : undefined
      return (
        <a href={value.href} rel={rel} target={target} className="text-primary hover:underline">
          {children}
        </a>
      )
    },
    code: ({children}) => (
      <code className="bg-background-alt px-xs py-xxs rounded-sm text-sm font-mono">
        {children}
      </code>
    ),
    strong: ({children}) => <span className="text-text">{children}</span>,
  },
  block: {
    h1: ({children}) => (
      <h1 className="text-3xl font-black tracking-tighter mt-xl mb-md text-text">{children}</h1>
    ),
    h2: ({children}) => <h2 className="text-2xl font-bold mt-lg mb-sm text-text">{children}</h2>,
    h3: ({children}) => <h3 className="text-xl font-bold mt-lg mb-sm text-text">{children}</h3>,
    h4: ({children}) => <h4 className="text-lg font-bold mt-md mb-sm text-text">{children}</h4>,
    normal: ({children}) => <p className="mb-md leading-relaxed text-text">{children}</p>,
    blockquote: ({children}) => (
      <blockquote className="border-l-4 border-primary pl-md my-lg italic text-text-secondary">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({children}) => <ul className="list-disc pl-lg mb-md space-y-xs">{children}</ul>,
    number: ({children}) => <ol className="list-decimal pl-lg mb-md space-y-xs">{children}</ol>,
  },
  listItem: {
    bullet: ({children}) => <li>{children}</li>,
    number: ({children}) => <li>{children}</li>,
  },
}

export function ArticleBody({body}: ArticleBodyProps) {
  return <PortableText value={body} components={components} />
}
