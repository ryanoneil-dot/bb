import type { ReactNode } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function Layout({ children }: { children: ReactNode }) {
  const { data: session } = useSession()

  return (
    <div className="page">
      <header className="topbar">
        <Link href="/" className="brand">
          <div className="brand-icon">BB</div>
          <div className="brand-text">
            <div className="brand-title">Builders</div>
            <div className="brand-sub">Bargains</div>
          </div>
        </Link>
        <div className="top-actions">
          {session ? (
            <>
              <Link className="btn-primary" href="/create">Sell</Link>
              <Link className="btn-outline" href="/account/listings">My Listings</Link>
              <Link className="btn-outline" href="/account">Account</Link>
            </>
          ) : (
            <>
              <Link className="btn-primary" href="/auth/signin">Sell</Link>
              <Link className="btn-outline" href="/auth/signin">Sign In</Link>
            </>
          )}
        </div>
      </header>
      {children}
    </div>
  )
}
