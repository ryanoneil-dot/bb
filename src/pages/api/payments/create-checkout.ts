import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { createCheckoutLink } from '../../../lib/square'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { sellerId, title, description, pricePence, lat, lng, images = [] } = req.body
  if (!sellerId || !title || !pricePence) return res.status(400).json({ error: 'Missing fields' })

  // create pending listing
  const pending = await prisma.pendingListing.create({
    data: {
      sellerId,
      title,
      description,
      pricePence: Number(pricePence),
      lat: Number(lat),
      lng: Number(lng),
      imagesJson: JSON.stringify(images),
    },
  })

  const redirectBase = process.env.NEXTAUTH_URL || `http://localhost:3000`
  const redirectUrl = `${redirectBase}/api/payments/complete?pendingId=${pending.id}`

  try {
    // pass pending.id as idempotency/referenceId so webhook can map payment -> pending listing
    const checkout = await createCheckoutLink(Number(100), redirectUrl, pending.id)
    // return checkout page url
    return res.status(200).json({ checkoutUrl: checkout.checkout.checkoutPageUrl, pendingId: pending.id })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Checkout error' })
  }
}
