import { useRouter } from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ListingDetail() {
  const router = useRouter()
  const id = router.query.id
  const { data, error } = useSWR(id ? `/api/listings/${id}` : null, fetcher)

  if (error) return <div className="content">Failed to load listing.</div>
  if (!data) return <div className="content">Loading...</div>

  const price = (data.pricePence / 100).toFixed(2)
  const image = data.images?.[0]?.url

  return (
    <main className="content">
      <Link href="/" className="btn-outline" style={{ marginBottom: 16, display: 'inline-flex' }}>← Back</Link>
      <div className="panel" style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ marginTop: 0 }}>{data.title}</h1>
        <p style={{ fontWeight: 700, fontSize: 18 }}>£{price}</p>
        {data.description && <p style={{ marginTop: 8 }}>{data.description}</p>}
        {image && (
          <div style={{ marginTop: 12 }}>
            <img src={image} alt={data.title} style={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 10 }} />
          </div>
        )}
      </div>
    </main>
  )
}
