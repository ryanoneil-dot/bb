import React, { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import CheckoutPreview from '../components/CheckoutPreview'

const DEFAULT_LAT = 53.6458
const DEFAULT_LNG = -3.0050
const categories = ['All', 'Timber', 'Masonry', 'Plumbing', 'Electrical', 'Tools', 'Paint', 'Landscaping']

export default function CreateListing() {
  const { data: session, status } = useSession()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('All')
  const [price, setPrice] = useState('')
  const [lat, setLat] = useState(String(DEFAULT_LAT))
  const [lng, setLng] = useState(String(DEFAULT_LNG))
  const [files, setFiles] = useState<FileList | null>(null)
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  if (status === 'loading') return <div className="content">Loading...</div>
  if (!session) {
    signIn(undefined, { callbackUrl: '/create' })
    return <div className="content">Redirecting to sign-in…</div>
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const uploaded: string[] = []
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const presignRes = await fetch('/api/uploads/presign', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, contentType: file.type }),
          })
          if (!presignRes.ok) throw new Error('Failed to get upload url')
          const presign = await presignRes.json()
          const putRes = await fetch(presign.url, { method: presign.method || 'PUT', headers: presign.headers || {}, body: file })
          if (!putRes.ok && putRes.status !== 200 && putRes.status !== 201) throw new Error('Upload failed')
          const publicUrl =
            presign.publicUrl ||
            (presign.key && process.env.NEXT_PUBLIC_S3_BASE_URL ? `${process.env.NEXT_PUBLIC_S3_BASE_URL}/${presign.key}` : presign.url)
          uploaded.push(publicUrl)
        }
      }

      const images = [...uploaded]

      const body = {
        title,
        description,
        category,
        pricePence: Math.round((parseFloat(price) || 0) * 100),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        images,
        contactName,
        contactPhone,
      }

      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Failed to start checkout')

      if (j.checkoutUrl) {
        setCheckoutUrl(j.checkoutUrl)
        setPendingId(j.pendingId)
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(j.checkoutUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 3000)
          }
        } catch (e) {
          // ignore clipboard failures
        }
      } else throw new Error('No checkout URL returned')
    } catch (err: any) {
      setError(err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="content">
      <div className="panel" style={{ maxWidth: 720, margin: '20px auto' }}>
        <h1 style={{ marginTop: 0 }}>Create listing</h1>
        <form onSubmit={submit}>
          <label style={{ display: 'block', marginTop: 8 }}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />

          <label style={{ display: 'block', marginTop: 8 }}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />

          <label style={{ display: 'block', marginTop: 8 }}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <label style={{ display: 'block', marginTop: 8 }}>Price (£)</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 15.00" required style={{ width: 160 }} />

          <label style={{ display: 'block', marginTop: 8 }}>Contact name</label>
          <input value={contactName} onChange={(e) => setContactName(e.target.value)} required />

          <label style={{ display: 'block', marginTop: 8 }}>Contact phone</label>
          <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />

          <label style={{ display: 'block', marginTop: 8 }}>Latitude</label>
          <input value={lat} onChange={(e) => setLat(e.target.value)} style={{ width: 160 }} />

          <label style={{ display: 'block', marginTop: 8 }}>Longitude</label>
          <input value={lng} onChange={(e) => setLng(e.target.value)} style={{ width: 160 }} />

          <label style={{ display: 'block', marginTop: 8 }}>Images</label>
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} />

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
            {loading ? 'Creating…' : 'Pay £1 and publish'}
          </button>
        </form>

        {checkoutUrl && <CheckoutPreview checkoutUrl={checkoutUrl} pendingId={pendingId || undefined} />}
      </div>
    </main>
  )
}
