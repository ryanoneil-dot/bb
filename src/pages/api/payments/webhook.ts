import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import crypto from 'crypto'

export const config = { api: { bodyParser: false } }

async function getRawBody(req: NextApiRequest) {
  // If a testing harness attached `rawBody`, use it (node-mocks-http, etc.).
  if ((req as any).rawBody) return (req as any).rawBody

  const chunks: Buffer[] = []
  for await (const chunk of req as any) {
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

export function verifySignature(rawBody: Buffer, signatureHeader?: string | string[] | null) {
  const sigKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
  if (!sigKey) return false
  if (!signatureHeader) return false
  const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader

  const hmac = crypto.createHmac('sha256', sigKey)
  hmac.update(rawBody)
  const expected = hmac.digest('base64')

  // Accept either base64 or hex encoded header values
  if (signature === expected) return true
  const hexExpected = Buffer.from(expected, 'base64').toString('hex')
  if (signature === hexExpected) return true
  return false
}

export async function handleWebhookPayload(payload: any) {
  // Basic handling: look for payment created/completed events and map via referenceId
  try {
    // Attempt to extract referenceId from common locations
    const referenceId = payload?.data?.object?.payment?.order_id || payload?.data?.object?.order?.reference_id || payload?.data?.object?.checkout?.reference_id || payload?.data?.object?.order?.referenceId || payload?.data?.object?.order?.referenceId

    if (referenceId) {
      const pending = await prisma.pendingListing.findUnique({ where: { id: referenceId } })
      if (pending && pending.status !== 'completed') {
        // Create listing
        const images: string[] = JSON.parse(pending.imagesJson || '[]')
        await prisma.listing.create({
          data: {
            sellerId: pending.sellerId,
            title: pending.title,
            description: pending.description,
            pricePence: pending.pricePence,
            lat: pending.lat,
            lng: pending.lng,
            images: { create: images.map((url) => ({ url })) },
          },
        })
        await prisma.pendingListing.update({ where: { id: pending.id }, data: { status: 'completed' } })
      }
    }
  } catch (err: any) {
    console.error('webhook processing error', err)
    throw err
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const raw = await getRawBody(req)
  const sigHeader = req.headers['x-square-signature'] || req.headers['x-square-hmacsha256-signature']
  const verified = verifySignature(raw, sigHeader as any)

  if (!verified) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  let payload: any
  try {
    payload = JSON.parse(raw.toString('utf8'))
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  try {
    await handleWebhookPayload(payload)
  } catch (err) {
    // swallow errors but acknowledge webhook
  }

  res.status(200).json({ received: true })
}
