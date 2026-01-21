import { useRouter } from 'next/router'
import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ListingDetail() {
  const router = useRouter()
  const id = router.query.id
  const { data, error } = useSWR(id ? `/api/listings/${id}` : null, fetcher)
  const [activeImage, setActiveImage] = useState<string | null>(null)

  if (error) return <div className="content">Failed to load listing.</div>
  if (!data) return <div className="content">Loading...</div>

  const price = (data.pricePence / 100).toFixed(2)
  const images: string[] = data.images?.map((img: any) => img.url) || []

  return (
    <main className="content">
      <Link href="/" className="btn-outline" style={{ marginBottom: 16, display: 'inline-flex' }}>← Back</Link>
      <div className="panel" style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ marginTop: 0 }}>{data.title}</h1>
        <p style={{ fontWeight: 700, fontSize: 18 }}>£{price}</p>
        {data.category && <p style={{ color: '#6b7380' }}>Category: {data.category}</p>}
        {data.description && <p style={{ marginTop: 8 }}>{data.description}</p>}
        {images.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginTop: 12 }}>
            {images.map((url) => (
              <div
                key={url}
                role="button"
                tabIndex={0}
                onClick={() => setActiveImage(url)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setActiveImage(url)
                }}
                style={{ cursor: 'zoom-in' }}
              >
                <img src={url} alt={data.title} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #eee' }}>
          <div><strong>Contact name:</strong> {data.contactName}</div>
          <div><strong>Phone:</strong> {data.contactPhone}</div>
          {data.pickupArea && <div><strong>Pickup area:</strong> {data.pickupArea}</div>}
        </div>
      </div>
      {activeImage && (
        <div
          role="presentation"
          onClick={() => setActiveImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 50,
          }}
        >
          <img
            src={activeImage}
            alt={data.title}
            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
          />
        </div>
      )}
    </main>
  )
}
