import type { NextApiRequest, NextApiResponse } from 'next'
import sharp from 'sharp'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { key } = req.body
  if (!key) return res.status(400).json({ error: 'Missing key' })

  const REGION = process.env.AWS_REGION
  const BUCKET = process.env.S3_BUCKET
  if (!REGION || !BUCKET) return res.status(500).json({ error: 'S3 not configured' })

  const client = new S3Client({ region: REGION })
  try {
    const get = await client.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
    const chunks: Buffer[] = []
    for await (const chunk of get.Body as any) chunks.push(chunk)
    const buf = Buffer.concat(chunks)
    const sizes = [320, 640]
    const uploaded: string[] = []
    for (const w of sizes) {
      const out = await sharp(buf).resize(w).jpeg({ quality: 80 }).toBuffer()
      const outKey = key.replace(/(\.[^.]+)$/, `-${w}$1`)
      await client.send(new PutObjectCommand({ Bucket: BUCKET, Key: outKey, Body: out, ContentType: 'image/jpeg' }))
      uploaded.push(outKey)
    }
    return res.status(200).json({ uploaded })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
