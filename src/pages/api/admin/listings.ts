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
  const session = await getServerSession(req, res, authOptions)
  if (!session || !isAdmin(session.user?.email)) return res.status(403).json({ error: 'Forbidden' })

  if (req.method === 'GET') {
    const listings = await prisma.listing.findMany({
      include: { images: true, seller: true },
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json(listings)
  }

  res.setHeader('Allow', ['GET'])
  res.status(405).end()
}
