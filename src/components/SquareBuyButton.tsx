import React from 'react'

type Props = {
  href?: string
  label?: string
}

export default function SquareBuyButton({ href, label }: Props) {
  const url = href || 'https://square.link/u/0qjenOxy?src=embed'
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={url}
      style={{
        display: 'inline-block',
        fontSize: 18,
        lineHeight: '48px',
        height: 48,
        color: '#ffffff',
        minWidth: 212,
        backgroundColor: '#006aff',
        textAlign: 'center',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1) inset',
        borderRadius: 6,
        textDecoration: 'none',
      }}
    >
      {label || 'Buy now'}
    </a>
  )
}
