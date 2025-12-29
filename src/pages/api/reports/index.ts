import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getSession } from 'next-auth/react'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const session = await getSession({ req })
    if (!session) return res.status(401).json({ error: 'Unauthorized' })
    const { listingId, reason } = req.body
    if (!listingId || !reason) return res.status(400).json({ error: 'Missing fields' })
    const report = await prisma.report.create({ data: { listingId, reason } })
    return res.status(201).json(report)
  }

  res.setHeader('Allow', ['POST'])
  res.status(405).end()
}
