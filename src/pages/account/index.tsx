import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Account() {
  const { data: session, status } = useSession()
  const isAdmin = session?.user?.email === 'aat'

  if (status === 'loading') return <div className="content">Loading...</div>
  if (!session) return (
    <main className="content">
      <div className="panel" style={{ maxWidth: 520, margin: '40px auto' }}>
        <h2>Not signed in</h2>
        <Link href="/auth/signin" className="btn-outline">Sign in</Link>
      </div>
    </main>
  )

  return (
    <main className="content">
      <div className="panel" style={{ maxWidth: 640, margin: '20px auto' }}>
        <h1 style={{ marginTop: 0 }}>Account</h1>
        <p>Signed in as {session.user?.email}</p>
        <p>User ID: {session.user?.id}</p>
        <div style={{ marginTop: 12 }}>
          <Link href="/create" className="btn-outline">Create listing</Link>
        </div>
        <div style={{ marginTop: 8 }}>
          <Link href="/account/listings" className="btn-outline">Manage listings</Link>
        </div>
        {isAdmin && (
          <div style={{ marginTop: 8 }}>
            <Link href="/admin" className="btn-outline">Admin dashboard</Link>
          </div>
        )}
        <button style={{ marginTop: 12 }} onClick={() => signOut({ callbackUrl: '/' })}>Sign out</button>
      </div>
    </main>
  )
}
