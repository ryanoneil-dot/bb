import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'
import { getSession } from 'next-auth/react'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string }
  if (!id) return res.status(400).json({ error: 'Missing id' })

  if (req.method === 'GET') {
    const listing = await prisma.listing.findUnique({ where: { id }, include: { images: true } })
    if (!listing) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(listing)
  }

  const session = await getSession({ req })
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  // Only the seller (or admin) may modify
  const userId = session.user?.id

  if (req.method === 'PUT') {
    const { title, description, pricePence, lat, lng } = req.body
    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) return res.status(404).json({ error: 'Not found' })
    if (listing.sellerId !== userId) return res.status(403).json({ error: 'Forbidden' })

    const updated = await prisma.listing.update({ where: { id }, data: { title, description, pricePence, lat: Number(lat), lng: Number(lng) } })
    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) return res.status(404).json({ error: 'Not found' })
    if (listing.sellerId !== userId) return res.status(403).json({ error: 'Forbidden' })
    await prisma.listing.delete({ where: { id } })
    return res.status(200).json({ deleted: true })
  }

  if (req.method === 'POST' && req.query.action === 'mark-sold') {
    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) return res.status(404).json({ error: 'Not found' })
    if (listing.sellerId !== userId) return res.status(403).json({ error: 'Forbidden' })
    const updated = await prisma.listing.update({ where: { id }, data: { sold: true } })
    return res.status(200).json(updated)
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
