import {PortableText, type PortableTextComponents} from 'next-sanity'

interface ProductDescriptionProps {
  description: any[] // Portable Text blocks
}

const components: PortableTextComponents = {
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
    strong: ({children}) => <strong className="font-bold">{children}</strong>,
    em: ({children}) => <em className="italic">{children}</em>,
    code: ({children}) => (
      <code className="bg-background-alt px-xs py-xxs rounded-sm text-sm font-mono">
        {children}
      </code>
    ),
  },
  block: {
    normal: ({children}) => <p className="mb-sm leading-relaxed">{children}</p>,
    h1: ({children}) => (
      <h3 className="text-xl font-bold mt-md mb-sm">{children}</h3>
    ),
    h2: ({children}) => (
      <h4 className="text-lg font-bold mt-md mb-sm">{children}</h4>
    ),
    h3: ({children}) => (
      <h5 className="text-base font-bold mt-sm mb-xs">{children}</h5>
    ),
    blockquote: ({children}) => (
      <blockquote className="border-l-4 border-primary pl-md my-md italic text-text-secondary">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({children}) => <ul className="list-disc pl-lg mb-sm space-y-xs">{children}</ul>,
    number: ({children}) => <ol className="list-decimal pl-lg mb-sm space-y-xs">{children}</ol>,
  },
  listItem: {
    bullet: ({children}) => <li>{children}</li>,
    number: ({children}) => <li>{children}</li>,
  },
}

export function ProductDescription({description}: ProductDescriptionProps) {
  if (!description || description.length === 0) {
    return null
  }
  return (
    <div className="text-text-secondary">
      <PortableText value={description} components={components} />
    </div>
  )
}
