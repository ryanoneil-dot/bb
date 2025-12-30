import useSWR from 'swr'
import React, { useMemo, useState } from 'react'
import Head from 'next/head'
import ListingCard from '../components/ListingCard'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const categories = ['All', 'Timber', 'Masonry', 'Plumbing', 'Electrical', 'Tools', 'Paint', 'Landscaping']

export default function Home() {
  const { data, error } = useSWR('/api/listings', fetcher)
  const [selected, setSelected] = useState('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!Array.isArray(data)) return []
    return data.filter((listing: any) => {
      const matchesCategory = selected === 'All' || listing.category === selected
      const haystack = `${listing.title || ''} ${listing.description || ''}`.toLowerCase()
      const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [data, selected, query])

  return (
    <>
      <Head>
        <title>Builders Bargains</title>
      </Head>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">SOUTHPORT&apos;S HOME FOR</div>
          <h1 className="hero-title">
            SURPLUS <span>MATERIALS</span>
          </h1>
          <p className="hero-copy">
            Don&apos;t skip it, list it. Connect with local tradespeople and DIYers in Southport and surrounding areas to buy and
            sell leftover building supplies.
          </p>
          <div className="search">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search for timber, bricks, tiles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="filters">
        <div className="pill-row">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`pill ${selected === cat ? 'pill-active' : ''}`}
              onClick={() => setSelected(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="content">
        <div className="listings-header">
          <h2>Latest bargains</h2>
          <span className="count">{Array.isArray(data) ? `${filtered.length} items found` : ''}</span>
        </div>
        {error && <div className="error">Failed to load listings</div>}
        {!data && !error && <div className="loading">Loading...</div>}
        {Array.isArray(data) && (
          <div className="grid">
            {filtered.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .hero {
          background: radial-gradient(circle at top left, #3b4048 0%, #2c313a 45%, #232831 100%);
          color: #fff;
          padding: 70px 20px 90px;
          border-bottom: 1px solid #1b1f26;
        }

        .hero-inner {
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .hero-eyebrow {
          font-family: 'Oswald', sans-serif;
          font-size: 28px;
          letter-spacing: 1px;
          opacity: 0.9;
        }

        .hero-title {
          margin: 10px 0 12px;
          font-family: 'Oswald', sans-serif;
          font-size: clamp(36px, 6vw, 64px);
          letter-spacing: 1px;
        }

        .hero-title span {
          color: var(--brand);
        }

        .hero-copy {
          max-width: 720px;
          margin: 0 auto 24px;
          color: #d9dee6;
          font-size: 18px;
        }

        .search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border-radius: 999px;
          padding: 12px 18px;
          max-width: 640px;
          margin: 0 auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .search-icon {
          font-size: 18px;
        }

        .search-input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 16px;
          font-family: inherit;
        }

        .filters {
          background: #f5f5f5;
          padding: 24px 20px 10px;
        }

        .pill-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .pill {
          border: 1px solid #cfd4db;
          background: #fff;
          color: #2a2f37;
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 14px;
          cursor: pointer;
        }

        .pill-active {
          background: var(--brand);
          border-color: var(--brand);
          color: #fff;
          font-weight: 600;
        }

        .listings-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .listings-header h2 {
          font-family: 'Oswald', sans-serif;
          font-size: 24px;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .count {
          color: #6b7380;
          font-size: 14px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 14px;
        }

        .loading,
        .error {
          padding: 20px 0;
        }

        @media (max-width: 600px) {
          .hero {
            padding: 60px 16px 70px;
          }

          .hero-eyebrow {
            font-size: 22px;
          }

          .hero-copy {
            font-size: 16px;
          }

          .listings-header {
            flex-direction: column;
            gap: 6px;
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  )
}
