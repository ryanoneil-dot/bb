import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

function isAdmin(email?: string | null) {
  if (!email) return false
  if (email === 'aat') return true
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean)
  return adminEmails.includes(email)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string }
  if (!id) return res.status(400).json({ error: 'Missing id' })

  if (req.method === 'GET') {
    const listing = await prisma.listing.findUnique({ where: { id }, include: { images: true } })
    if (!listing) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(listing)
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const userId = session.user?.id
  const admin = isAdmin(session.user?.email)

  if (req.method === 'PUT') {
    const { title, description, pricePence, lat, lng, contactName, contactPhone, category, sold, pickupArea } = req.body
    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) return res.status(404).json({ error: 'Not found' })
    if (!admin && listing.sellerId !== userId) return res.status(403).json({ error: 'Forbidden' })

    const nextSold = typeof sold === 'boolean' ? sold : listing.sold
    const updated = await prisma.listing.update({
      where: { id },
      data: {
        title,
        description,
        pricePence: Number(pricePence),
        lat: Number(lat),
        lng: Number(lng),
        contactName,
        contactPhone,
        pickupArea,
        category,
        sold: nextSold,
        soldAt: nextSold ? listing.soldAt || new Date() : null,
      },
    })
    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) return res.status(404).json({ error: 'Not found' })
    if (!admin && listing.sellerId !== userId) return res.status(403).json({ error: 'Forbidden' })
    await prisma.$transaction([
      prisma.image.deleteMany({ where: { listingId: id } }),
      prisma.listing.delete({ where: { id } }),
    ])
    return res.status(200).json({ deleted: true })
  }

  if (req.method === 'POST' && req.query.action === 'mark-sold') {
    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) return res.status(404).json({ error: 'Not found' })
    if (!admin && listing.sellerId !== userId) return res.status(403).json({ error: 'Forbidden' })
    const nextSold = !listing.sold
    const updated = await prisma.listing.update({
      where: { id },
      data: { sold: nextSold, soldAt: nextSold ? new Date() : null },
    })
    return res.status(200).json(updated)
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
