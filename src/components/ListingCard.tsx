import React from 'react'

export default function ListingCard({ listing }: { listing: any }) {
  const price = (listing.pricePence / 100).toFixed(2)
  const img = listing.images?.[0]?.url || '/placeholder.png'
  return (
    <article style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
      <img src={img} alt={listing.title} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 4 }} />
      <h3 style={{ marginTop: 8 }}>{listing.title}</h3>
      <p style={{ margin: '4px 0' }}>{listing.description}</p>
      <p style={{ fontWeight: 700 }}>£{price}</p>
      <p style={{ fontSize: 12, color: '#666' }}>Seller ID: {listing.sellerId}</p>
    </article>
  )
}
