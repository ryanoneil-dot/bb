import React from 'react'
import Link from 'next/link'

export default function ListingCard({ listing }: { listing: any }) {
  const price = (listing.pricePence / 100).toFixed(2)
  const img = listing.images?.[0]?.url || '/placeholder.png'
  return (
    <Link href={`/listings/${listing.id}`} className="card">
      <div className="thumb" style={{ backgroundImage: `url(${img})` }} />
      <div className="card-body">
        <div className="card-title">{listing.title}</div>
        <div className="card-price">£{price}</div>
      </div>
      {listing.category && <div className="card-cat">{listing.category}</div>}
      <style jsx>{`
        .card {
          position: relative;
          display: block;
          background: #fff;
          border: 1px solid #e4e7ec;
          border-radius: 14px;
          text-decoration: none;
          color: inherit;
          overflow: hidden;
          box-shadow: 0 6px 18px rgba(24, 32, 42, 0.08);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 26px rgba(24, 32, 42, 0.12);
        }

        .thumb {
          width: 100%;
          height: 150px;
          background-size: cover;
          background-position: center;
          background-color: #dfe3e8;
        }

        .card-body {
          padding: 12px 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .card-title {
          font-weight: 600;
          font-size: 15px;
        }

        .card-price {
          background: #f1f3f6;
          padding: 6px 10px;
          border-radius: 999px;
          font-weight: 700;
        }

        .card-cat {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 12px;
        }
      `}</style>
    </Link>
  )
}
