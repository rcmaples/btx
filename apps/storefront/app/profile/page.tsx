import type {Metadata} from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'View and edit your Batch Theory profile.',
}

// Profile page stubbed during Supabase removal
// Will be fully implemented with Clerk auth in Phase 2
export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-black tracking-tighter mb-xl">My Profile</h1>

      <div className="bg-background-secondary border-2 border-border p-xl">
        <div className="text-center py-xl">
          <p className="text-text-secondary mb-lg">
            Authentication is being upgraded. Profile features will be available soon.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary text-background px-xl py-md border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-fast font-bold"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
