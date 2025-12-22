import Link from 'next/link'

export function EmptyCart() {
  return (
    <div className="text-center py-2xl">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-md">Your cart is empty</h2>
        <p className="text-text-secondary mb-lg">
          Start adding some coffee to your cart to get brewing.
        </p>
        <Link
          href="/products"
          className="inline-block bg-primary text-background px-xl py-md border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-fast font-bold"
        >
          Browse Products
        </Link>
      </div>
    </div>
  )
}
