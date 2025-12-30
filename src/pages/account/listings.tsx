import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function MyListings() {
  const { data: session } = useSession()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setError(null)
      const res = await fetch('/api/listings?mine=true')
      if (!res.ok) {
        setError('Failed to load listings.')
        setLoading(false)
        return
      }
      const data = await res.json()
      setListings(data)
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

  if (!session) return <div className="content">Please sign in to manage listings.</div>
  if (loading) return <div className="content">Loading…</div>

  return (
    <main className="content">
      <div className="panel">
        <h1 style={{ marginTop: 0 }}>My listings</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {listings.length === 0 && <p>No listings</p>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {listings.map((l) => (
            <li key={l.id} style={{ marginBottom: 12, padding: 12, borderBottom: '1px solid #eee' }}>
              <strong>{l.title}</strong> — £{(l.pricePence / 100).toFixed(2)} {l.sold ? '(SOLD)' : ''}
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => markSold(l.id)} disabled={l.sold}>Mark sold</button>
                <button onClick={() => del(l.id)} style={{ background: '#2a2f37' }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
