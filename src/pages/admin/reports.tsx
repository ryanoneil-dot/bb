import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function AdminReports() {
  const { data: session } = useSession()
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/reports')
      if (!res.ok) return
      const data = await res.json()
      setReports(data)
    }
    if (session) load()
  }, [session])

  if (!session) return <div className="content">Please sign in.</div>

  return (
    <main className="content">
      <div className="panel">
        <h1 style={{ marginTop: 0 }}>Reports</h1>
        {reports.length === 0 && <p>No reports</p>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {reports.map((r) => (
            <li key={r.id} style={{ marginBottom: 12, padding: 12, borderBottom: '1px solid #eee' }}>
              Listing: {r.listingId} — {r.reason} — {new Date(r.createdAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
