import { createMocks } from 'node-mocks-http'
import crypto from 'crypto'

// Prepare a mocked prisma module before importing the handler to avoid requiring a generated client.
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
}

jest.mock('../src/lib/prisma', () => ({ prisma: mockPrisma }))

// Import the handler after mocking prisma
const handlerModule = require('../src/pages/api/payments/webhook')
const handler = handlerModule.default
const { verifySignature } = handlerModule

describe('webhook API (e2e)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.SQUARE_WEBHOOK_SIGNATURE_KEY = 'testkey'
  })

  test('POST /api/payments/webhook verifies signature and returns 200', async () => {
    const payload = { data: { object: { order: { reference_id: 'pending-1' } } } }
    const raw = Buffer.from(JSON.stringify(payload))
    const hmac = crypto.createHmac('sha256', process.env.SQUARE_WEBHOOK_SIGNATURE_KEY as string)
    hmac.update(raw)
    const sig = hmac.digest('base64')

    const { req, res } = createMocks({
      method: 'POST',
      headers: { 'x-square-signature': sig, 'content-type': 'application/json' },
      body: payload,
    })

    // node-mocks-http doesn't provide raw body by default; attach it so our handler's raw-body logic can use it.
    ;(req as any).rawBody = raw

    await handler(req as any, res as any)

    expect(res._getStatusCode()).toBe(200)
  })

  test('verifySignature returns false for bad signature', () => {
    const body = Buffer.from(JSON.stringify({ hello: 'world' }))
    expect(verifySignature(body, 'bad')).toBe(false)
  })
})
