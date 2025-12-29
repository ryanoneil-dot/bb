import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getSession } from 'next-auth/react'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean)
  if (!adminEmails.includes(session.user?.email || '')) return res.status(403).json({ error: 'Forbidden' })

  if (req.method === 'GET') {
    const reports = await prisma.report.findMany({ orderBy: { createdAt: 'desc' } })
    return res.status(200).json(reports)
  }

  res.setHeader('Allow', ['GET'])
  res.status(405).end()
}
