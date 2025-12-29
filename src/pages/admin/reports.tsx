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

  if (!session) return <div>Please sign in.</div>

  return (
    <main style={{ padding: 20 }}>
      <h1>Reports</h1>
      {reports.length === 0 && <p>No reports</p>}
      <ul>
        {reports.map((r) => (
          <li key={r.id} style={{ marginBottom: 12 }}>
            Listing: {r.listingId} — {r.reason} — {new Date(r.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </main>
  )
}
