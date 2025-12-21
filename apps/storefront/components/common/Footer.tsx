export const Footer = () => {
  return (
    <footer className="border-t border-border-light bg-background-alt" role="contentinfo">
      <div className="max-w-[1400px] mx-auto px-xl py-xl text-center">
        <p className="text-sm text-text-muted">
          &copy; {new Date().getFullYear()} Batch Theory. Test mode only.
        </p>
      </div>
    </footer>
  )
}
