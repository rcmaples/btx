import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-md">
      <h1 className="text-5xl font-black mb-md">404</h1>
      <h2 className="text-3xl font-bold mb-md">Page Not Found</h2>
      <p className="text-text-muted mb-lg max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-primary text-background px-lg py-sm border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-fast no-underline"
      >
        Return Home
      </Link>
    </div>
  )
}
