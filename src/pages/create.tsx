import React, { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import SquareBuyButton from '../components/SquareBuyButton'
import CheckoutPreview from '../components/CheckoutPreview'

const DEFAULT_LAT = 53.6458
const DEFAULT_LNG = -3.0050

export default function CreateListing() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [lat, setLat] = useState(String(DEFAULT_LAT))
  const [lng, setLng] = useState(String(DEFAULT_LNG))
  const [imagesText, setImagesText] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  if (status === 'loading') return <div>Loading...</div>
  if (!session) {
    signIn(undefined, { callbackUrl: '/create' })
    return <div>Redirecting to sign-in…</div>
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // prepare image URLs: upload selected files (if any) via presigned URLs, then include pasted URLs
      const fromText = imagesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)

      const uploaded: string[] = []
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          // request a presigned URL
          const presignRes = await fetch('/api/uploads/presign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, contentType: file.type }),
          })
          if (!presignRes.ok) throw new Error('Failed to get upload url')
          const presign = await presignRes.json()
          // upload directly to the presigned URL
          const putRes = await fetch(presign.url, { method: presign.method || 'PUT', headers: presign.headers || {}, body: file })
          if (!putRes.ok && putRes.status !== 200 && putRes.status !== 201) throw new Error('Upload failed')
          // constructed public URL: if returned key present and bucket env exists, construct full URL, otherwise use presign.url
          const publicUrl = presign.key && process.env.NEXT_PUBLIC_S3_BASE_URL ? `${process.env.NEXT_PUBLIC_S3_BASE_URL}/${presign.key}` : presign.url
          uploaded.push(publicUrl)
        }
      }

      const images = [...uploaded, ...fromText]

      const body = {
        sellerId: session.user?.id,
        title,
        description,
        pricePence: Math.round((parseFloat(price) || 0) * 100),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        images,
      }

      // Start Square checkout flow for £1 listing fee
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Failed to start checkout')

      // Open Square checkout in a centered popup (better UX than full redirect)
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
        const url = j.checkoutUrl
        const title = 'Square Payment Links'

        const topWindow: any = window.top || window
        const dualScreenLeft = topWindow.screenLeft !== undefined ? topWindow.screenLeft : topWindow.screenX
        const dualScreenTop = topWindow.screenTop !== undefined ? topWindow.screenTop : topWindow.screenY

        const width = topWindow.innerWidth || document.documentElement.clientWidth || screen.width
        const height = topWindow.innerHeight || document.documentElement.clientHeight || screen.height

        const h = height * 0.75
        const w = 500

        const systemZoom = width / topWindow.screen.availWidth
        const left = (width - w) / 2 / systemZoom + dualScreenLeft
        const top = (height - h) / 2 / systemZoom + dualScreenTop
        const newWindow = window.open(url, title, `scrollbars=yes, width=${w / systemZoom}, height=${h / systemZoom}, top=${top}, left=${left}`)
        if (newWindow && newWindow.focus) newWindow.focus()
      } else throw new Error('No checkout URL returned')
    } catch (err: any) {
      setError(err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 720 }}>
      <h1>Create listing</h1>
      <form onSubmit={submit}>
        <label style={{ display: 'block', marginTop: 8 }}>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: 8 }} />

        <label style={{ display: 'block', marginTop: 8 }}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ width: '100%', padding: 8 }} />

        <label style={{ display: 'block', marginTop: 8 }}>Price (£)</label>
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 15.00" required style={{ width: '160px', padding: 8 }} />

        <label style={{ display: 'block', marginTop: 8 }}>Latitude</label>
        <input value={lat} onChange={(e) => setLat(e.target.value)} style={{ width: '160px', padding: 8 }} />

        <label style={{ display: 'block', marginTop: 8 }}>Longitude</label>
        <input value={lng} onChange={(e) => setLng(e.target.value)} style={{ width: '160px', padding: 8 }} />

        <label style={{ display: 'block', marginTop: 8 }}>Images</label>
        <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} />
        <small style={{ display: 'block', marginTop: 6, color: '#666' }}>Or paste image URLs (one per line)</small>
        <textarea value={imagesText} onChange={(e) => setImagesText(e.target.value)} rows={4} style={{ width: '100%', padding: 8 }} placeholder="https://...\nhttps://..." />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading} style={{ marginTop: 12, padding: '8px 12px' }}>
          {loading ? 'Creating…' : 'Create listing'}
        </button>
      </form>

      <div style={{ marginTop: 18 }}>
        <p style={{ color: '#666' }}>Quick test buy button (opens Square link):</p>
        <SquareBuyButton />
      </div>

      {checkoutUrl && <CheckoutPreview checkoutUrl={checkoutUrl} pendingId={pendingId || undefined} />}
    </main>
  )
}

