import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

const SOUTHPORT_LAT = parseFloat(process.env.SOUTHPORT_LAT || '53.6458')
const SOUTHPORT_LNG = parseFloat(process.env.SOUTHPORT_LNG || '-3.0050')
const MAX_DISTANCE_MILES = parseFloat(process.env.MAX_DISTANCE_MILES || '15')

function milesBetween(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180
  const R = 3958.8
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    await prisma.listing.deleteMany({
      where: { sold: true, soldAt: { lt: cutoff } },
    })

    const mine = req.query.mine === 'true' || req.query.mine === '1'
    if (mine) {
      const session = await getServerSession(req, res, authOptions)
      if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })
      const listings = await prisma.listing.findMany({
        where: { sellerId: session.user.id },
        include: { images: true },
        orderBy: { createdAt: 'desc' },
      })
      return res.status(200).json(listings)
    }

    const listings = await prisma.listing.findMany({
      where: {
        OR: [
          { sold: false },
          { sold: true, soldAt: { gte: cutoff } },
        ],
      },
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    })
    const filtered = listings.filter((l: any) => {
      const dist = milesBetween(SOUTHPORT_LAT, SOUTHPORT_LNG, l.lat, l.lng)
      return dist <= MAX_DISTANCE_MILES
    })
    return res.status(200).json(filtered)
  }

  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })

    const { title, description, category, pricePence, lat, lng, images = [], contactName, contactPhone, pickupArea } = req.body
    const parsedPrice = Number(pricePence)
    const parsedLat = Number(lat)
    const parsedLng = Number(lng)
    if (!title || !contactName || !contactPhone || Number.isNaN(parsedPrice) || Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
      return res.status(400).json({ error: 'Missing fields' })
    }
    const listing = await prisma.listing.create({
      data: {
        sellerId: session.user.id,
        title,
        description,
        category: category || 'All',
        pricePence: parsedPrice,
        lat: parsedLat,
        lng: parsedLng,
        images: { create: images.map((url: string) => ({ url })) },
        contactName,
        contactPhone,
        pickupArea,
      },
      include: { images: true },
    })
    return res.status(201).json(listing)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
