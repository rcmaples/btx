import {CheckoutClient} from './CheckoutClient'

// Checkout page - auth integration stubbed during migration
// Will be fully implemented with Clerk auth in Phase 2
export default function CheckoutPage() {
  // Pass null for user/profile during migration
  return <CheckoutClient initialUser={null} initialProfile={null} />
}
