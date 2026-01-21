import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { createCheckoutLink } from '../../../lib/square'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = (await getServerSession(req, res, authOptions)) as any
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })

  const { title, description, category, pricePence, lat, lng, images = [], contactName, contactPhone } = req.body
  const parsedPrice = Number(pricePence)
  const parsedLat = Number(lat)
  const parsedLng = Number(lng)
  if (!title || !contactName || !contactPhone || Number.isNaN(parsedPrice) || Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  const pending = await prisma.pendingListing.create({
    data: {
      sellerId: session.user.id,
      title,
      description,
      category: category || 'All',
      pricePence: parsedPrice,
      lat: parsedLat,
      lng: parsedLng,
      imagesJson: JSON.stringify(images),
      contactName,
      contactPhone,
    },
  })

  const redirectBase = process.env.NEXTAUTH_URL || `http://localhost:3000`
  const redirectUrl = `${redirectBase}/api/payments/complete?pendingId=${pending.id}`

  try {
    const checkout = await createCheckoutLink(Number(100), redirectUrl, pending.id)
    return res.status(200).json({ checkoutUrl: checkout.checkout.checkoutPageUrl, pendingId: pending.id })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Checkout error' })
  }
}
