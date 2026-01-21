import type { NextApiRequest, NextApiResponse } from 'next'
import { getPresignedUploadUrl } from '../../../lib/s3'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import cuid from 'cuid'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = (await getServerSession(req, res, authOptions)) as any
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const { filename, contentType } = req.body
  if (!filename) return res.status(400).json({ error: 'Missing filename' })

  const userId = session?.user?.id || 'anon'
  const key = `uploads/${userId}/${cuid()}-${filename}`
  const publicBaseUrl =
    process.env.NEXT_PUBLIC_S3_BASE_URL ||
    (process.env.S3_BUCKET && process.env.AWS_REGION
      ? `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`
      : '')
  const publicUrl = publicBaseUrl ? `${publicBaseUrl}/${key}` : undefined

  try {
    const presign = await getPresignedUploadUrl(key, contentType || 'image/jpeg')
    return res.status(200).json({ ...presign, key, publicUrl })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'presign error' })
  }
}
