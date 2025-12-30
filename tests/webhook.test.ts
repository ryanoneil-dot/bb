import crypto from 'crypto'

const mockPending = {
  id: 'pending-1',
  sellerId: 'user-1',
  title: 'Leftover bricks',
  description: 'A few boxes',
  pricePence: 5000,
  lat: 53.6458,
  lng: -3.0050,
  imagesJson: JSON.stringify(['https://example.com/img1.jpg']),
  status: 'pending',
  contactName: 'Sam Builder',
  contactPhone: '07123456789',
}

const createdListing = { id: 'listing-1' }

const mockPrisma = {
  pendingListing: {
    findUnique: jest.fn().mockResolvedValue(mockPending),
    update: jest.fn().mockResolvedValue({}),
  },
  listing: {
    create: jest.fn().mockResolvedValue(createdListing),
  },
  webhookEvent: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    upsert: jest.fn().mockResolvedValue({}),
    updateMany: jest.fn().mockResolvedValue({}),
  },
  user: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: mockPending.sellerId, email: `${mockPending.sellerId}@dev.local`, name: 'Dev User' }),
  },
}

jest.mock('../src/lib/prisma', () => ({ prisma: mockPrisma }))

import { handleWebhookPayload, verifySignature } from '../src/pages/api/payments/webhook'
import * as prismaModule from '../src/lib/prisma'

describe('webhook handler helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.SQUARE_WEBHOOK_SIGNATURE_KEY = 'testkey'
  })

  test('verifySignature accepts valid HMAC-SHA256 signature (base64)', () => {
    const body = Buffer.from(JSON.stringify({ hello: 'world' }))
    const hmac = crypto.createHmac('sha256', process.env.SQUARE_WEBHOOK_SIGNATURE_KEY as string)
    hmac.update(body)
    const sig = hmac.digest('base64')
    expect(verifySignature(body, sig)).toBe(true)
  })

  test('handleWebhookPayload creates listing from pending', async () => {
    const payload = { data: { object: { order: { reference_id: 'pending-1' } } } }
    await handleWebhookPayload(payload as any)

    expect(prismaModule.prisma.pendingListing.findUnique).toHaveBeenCalledWith({ where: { id: 'pending-1' } })
    expect(prismaModule.prisma.listing.create).toHaveBeenCalled()
    expect(prismaModule.prisma.pendingListing.update).toHaveBeenCalledWith({ where: { id: mockPending.id }, data: { status: 'completed' } })
  })

  test('verifySignature rejects invalid signature', () => {
    const body = Buffer.from(JSON.stringify({ hello: 'world' }))
    expect(verifySignature(body, 'bad-signature')).toBe(false)
  })

  test('handleWebhookPayload does nothing when no referenceId', async () => {
    const payload = { data: {} }
    await handleWebhookPayload(payload as any)

    expect(prismaModule.prisma.pendingListing.findUnique).not.toHaveBeenCalled()
    expect(prismaModule.prisma.listing.create).not.toHaveBeenCalled()
    expect(prismaModule.prisma.pendingListing.update).not.toHaveBeenCalled()
  })

  test('handleWebhookPayload does nothing when pending not found', async () => {
    (prismaModule.prisma.pendingListing.findUnique as jest.Mock).mockResolvedValueOnce(null)
    const payload = { data: { object: { order: { reference_id: 'missing-id' } } } }
    await handleWebhookPayload(payload as any)

    expect(prismaModule.prisma.pendingListing.findUnique).toHaveBeenCalledWith({ where: { id: 'missing-id' } })
    expect(prismaModule.prisma.listing.create).not.toHaveBeenCalled()
    expect(prismaModule.prisma.pendingListing.update).not.toHaveBeenCalled()
  })

  test('handleWebhookPayload throws on malformed imagesJson', async () => {
    const badPending = { ...mockPending, id: 'bad-json', imagesJson: 'not-a-json' }
    ;(prismaModule.prisma.pendingListing.findUnique as jest.Mock).mockResolvedValueOnce(badPending)
    const payload = { data: { object: { order: { reference_id: 'bad-json' } } } }
    await expect(handleWebhookPayload(payload as any)).rejects.toThrow()
  })
})
