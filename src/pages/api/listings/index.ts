import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

const SOUTHPORT_LAT = parseFloat(process.env.SOUTHPORT_LAT || '53.6458')
const SOUTHPORT_LNG = parseFloat(process.env.SOUTHPORT_LNG || '-3.0050')
const MAX_DISTANCE_MILES = parseFloat(process.env.MAX_DISTANCE_MILES || '15')

function milesBetween(lat1: number, lon1: number, lat2: number, lon2: number) {
  // Haversine
  const toRad = (x: number) => (x * Math.PI) / 180
  const R = 3958.8 // miles
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // simple browse: return listings within radius of Southport center
    const listings = await prisma.listing.findMany({ where: { sold: false }, include: { images: true } })
    const filtered = listings.filter((l) => {
      const dist = milesBetween(SOUTHPORT_LAT, SOUTHPORT_LNG, l.lat, l.lng)
      return dist <= MAX_DISTANCE_MILES
    })
    return res.status(200).json(filtered)
  }

  if (req.method === 'POST') {
    // create listing (expects sellerId, title, pricePence, lat, lng)
    const { sellerId, title, description, pricePence, lat, lng, images = [] } = req.body
    if (!sellerId || !title || !pricePence || lat == null || lng == null) {
      return res.status(400).json({ error: 'Missing fields' })
    }
    const listing = await prisma.listing.create({
      data: {
        sellerId,
        title,
        description,
        pricePence,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        images: { create: images.map((url: string) => ({ url })) },
      },
      include: { images: true },
    })
    return res.status(201).json(listing)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
