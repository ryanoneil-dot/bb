import useSWR from 'swr'
import React from 'react'
import ListingCard from '../components/ListingCard'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function Home() {
  const { data, error } = useSWR('/api/listings', fetcher)

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  return (
    <main style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Builders Bargains — Local Materials near Southport</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 12 }}>
        {data.map((listing: any) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </main>
  )
}
