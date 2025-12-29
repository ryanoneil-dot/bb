import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function MyListings() {
  const { data: session } = useSession()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/listings')
      if (!res.ok) return
      const data = await res.json()
      // filter to user's listings
      const mine = data.filter((l: any) => l.sellerId === session?.user?.id)
      setListings(mine)
      setLoading(false)
    }
    if (session) load()
  }, [session])

  async function del(id: string) {
    if (!confirm('Delete listing?')) return
    await fetch(`/api/listings/${id}`, { method: 'DELETE' })
    setListings((s) => s.filter((l) => l.id !== id))
  }

  async function markSold(id: string) {
    await fetch(`/api/listings/${id}?action=mark-sold`, { method: 'POST' })
    setListings((s) => s.map((l) => (l.id === id ? { ...l, sold: true } : l)))
  }

  if (!session) return <div>Please sign in to manage listings.</div>
  if (loading) return <div>Loading…</div>

  return (
    <main style={{ padding: 20 }}>
      <h1>My listings</h1>
      {listings.length === 0 && <p>No listings</p>}
      <ul>
        {listings.map((l) => (
          <li key={l.id} style={{ marginBottom: 12 }}>
            <strong>{l.title}</strong> — £{(l.pricePence / 100).toFixed(2)} {l.sold ? '(SOLD)' : ''}
            <div>
              <button onClick={() => markSold(l.id)} disabled={l.sold} style={{ marginRight: 8 }}>
                Mark sold
              </button>
              <button onClick={() => del(l.id)} style={{ marginRight: 8 }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
