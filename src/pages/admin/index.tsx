import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

const categories = [
  'All',
  'Timber',
  'Masonry',
  'Plumbing',
  'Electrical',
  'Tools',
  'Paint',
  'Landscaping',
  'Insulation',
  'Roofing',
  'Windows & Doors',
  'Flooring',
  'Garden & Outdoor',
  'Bathrooms',
  'Kitchens',
  'Fixings & Hardware',
  'Other',
]

export default function AdminListings() {
  const { data: session } = useSession()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setError(null)
      const res = await fetch('/api/admin/listings', { credentials: 'include' })
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

  async function updateListing(id: string, data: any) {
    const res = await fetch(`/api/listings/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return
    const updated = await res.json()
    setListings((s) => s.map((l) => (l.id === id ? { ...l, ...updated } : l)))
  }

  async function del(id: string) {
    if (!confirm('Delete listing?')) return
    await fetch(`/api/listings/${id}`, { method: 'DELETE', credentials: 'include' })
    setListings((s) => s.filter((l) => l.id !== id))
  }

  async function markSold(id: string) {
    const res = await fetch(`/api/listings/${id}?action=mark-sold`, { method: 'POST', credentials: 'include' })
    if (!res.ok) return
    const updated = await res.json()
    setListings((s) => s.map((l) => (l.id === id ? { ...l, ...updated } : l)))
  }

  if (!session) return <div className="content">Please sign in.</div>
  if (loading) return <div className="content">Loading…</div>

  return (
    <main className="content">
      <div className="panel">
        <h1 style={{ marginTop: 0 }}>Admin listings</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {listings.length === 0 && <p>No listings</p>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {listings.map((l) => (
            <li key={l.id} style={{ marginBottom: 16, padding: 12, borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <strong>{l.title}</strong>
                <span>£{(l.pricePence / 100).toFixed(2)} {l.sold ? '(SOLD)' : ''}</span>
              </div>
              <div style={{ marginTop: 8, color: '#666' }}>
                Seller: {l.seller?.email || l.sellerId}
              </div>
              <div style={{ marginTop: 8 }}>
                <label style={{ display: 'block', marginTop: 8 }}>Title</label>
                <input defaultValue={l.title} onBlur={(e) => updateListing(l.id, { title: e.target.value })} />

                <label style={{ display: 'block', marginTop: 8 }}>Description</label>
                <textarea defaultValue={l.description} rows={3} onBlur={(e) => updateListing(l.id, { description: e.target.value })} />

                <label style={{ display: 'block', marginTop: 8 }}>Category</label>
                <select defaultValue={l.category || 'All'} onChange={(e) => updateListing(l.id, { category: e.target.value })}>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <label style={{ display: 'block', marginTop: 8 }}>Price (pence)</label>
                <input defaultValue={l.pricePence} onBlur={(e) => updateListing(l.id, { pricePence: Number(e.target.value) || l.pricePence })} />

                <label style={{ display: 'block', marginTop: 8 }}>Contact name</label>
                <input defaultValue={l.contactName} onBlur={(e) => updateListing(l.id, { contactName: e.target.value })} />

                <label style={{ display: 'block', marginTop: 8 }}>Contact phone</label>
                <input defaultValue={l.contactPhone} onBlur={(e) => updateListing(l.id, { contactPhone: e.target.value })} />

                <label style={{ display: 'block', marginTop: 8 }}>Pickup area</label>
                <input defaultValue={l.pickupArea || ''} onBlur={(e) => updateListing(l.id, { pickupArea: e.target.value })} />
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => markSold(l.id)}>{l.sold ? 'Undo sold' : 'Mark sold'}</button>
                <button onClick={() => del(l.id)} style={{ background: '#2a2f37' }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
