import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Account() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>Loading...</div>
  if (!session) return (
    <main style={{ padding: 20 }}>
      <h2>Not signed in</h2>
      <Link href="/auth/signin">Sign in</Link>
    </main>
  )

  return (
    <main style={{ padding: 20 }}>
      <h1>Account</h1>
      <p>Signed in as {session.user?.email}</p>
      <p>User ID: {session.user?.id}</p>
      <div style={{ marginTop: 12 }}>
        <Link href="/create">Create listing</Link>
      </div>
      <button style={{ marginTop: 12 }} onClick={() => signOut({ callbackUrl: '/' })}>Sign out</button>
    </main>
  )
}
