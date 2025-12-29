import React, { useState } from 'react'
import SquareBuyButton from './SquareBuyButton'

type Props = {
  checkoutUrl?: string
  pendingId?: string
}

export default function CheckoutPreview({ checkoutUrl, pendingId }: Props) {
  const [copied, setCopied] = useState(false)
  if (!checkoutUrl) return null

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(checkoutUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (err) {
      // ignore clipboard failures
    }
  }

  return (
    <div style={{ marginTop: 16, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
      <h3 style={{ margin: '0 0 8px 0' }}>Checkout ready</h3>
      <p style={{ margin: '0 0 8px 0', color: '#555' }}>Pending ID: {pendingId}</p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <SquareBuyButton href={checkoutUrl} label="Pay £1 to publish" />
        <button onClick={copy} aria-label="Copy checkout link" style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', background: '#fff' }}>
          {copied ? 'Copied!' : 'Copy link'}
        </button>
        <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#006aff' }}>
          Open in new tab
        </a>
      </div>

      <div style={{ marginTop: 12 }}>
        <small style={{ color: '#666' }}>Direct link (for sharing or embedding):</small>
        <div style={{ marginTop: 6 }}>
          <input readOnly value={checkoutUrl} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #eee' }} />
        </div>
      </div>
    </div>
  )
}
