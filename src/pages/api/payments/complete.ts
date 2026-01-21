import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { pendingId } = req.query
  if (!pendingId || typeof pendingId !== 'string') return res.status(400).send('Missing pendingId')

  const pending = await prisma.pendingListing.findUnique({ where: { id: pendingId } })
  if (!pending) return res.status(404).send('Pending listing not found')

  if (pending.status === 'completed') {
    return res.redirect(`/account`)
  }

  const images: string[] = JSON.parse(pending.imagesJson || '[]')
  await prisma.listing.create({
    data: {
      sellerId: pending.sellerId,
      title: pending.title,
      description: pending.description,
      category: pending.category,
      pricePence: pending.pricePence,
      lat: pending.lat,
      lng: pending.lng,
      images: { create: images.map((url) => ({ url })) },
      contactName: pending.contactName,
      contactPhone: pending.contactPhone,
      pickupArea: pending.pickupArea,
    },
    include: { images: true },
  })

  await prisma.pendingListing.update({ where: { id: pending.id }, data: { status: 'completed' } })

  return res.redirect('/account')
}
