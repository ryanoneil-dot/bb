import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This is the redirect target after Square checkout completes.
  // For a secure production flow, verify payment via webhooks or Square APIs.
  const { pendingId } = req.query
  if (!pendingId || typeof pendingId !== 'string') return res.status(400).send('Missing pendingId')

  const pending = await prisma.pendingListing.findUnique({ where: { id: pendingId } })
  if (!pending) return res.status(404).send('Pending listing not found')

  if (pending.status === 'completed') {
    return res.redirect(`/account`)
  }

  // Create actual listing from pending
  const images: string[] = JSON.parse(pending.imagesJson || '[]')
  const listing = await prisma.listing.create({
    data: {
      sellerId: pending.sellerId,
      title: pending.title,
      description: pending.description,
      pricePence: pending.pricePence,
      lat: pending.lat,
      lng: pending.lng,
      images: { create: images.map((url) => ({ url })) },
    },
    include: { images: true },
  })

  await prisma.pendingListing.update({ where: { id: pending.id }, data: { status: 'completed' } })

  // redirect user to account or listing page
  return res.redirect('/account')
}
