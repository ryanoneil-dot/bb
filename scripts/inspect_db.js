const { PrismaClient } = require('@prisma/client')
;(async () => {
  const p = new PrismaClient()
  try {
    const pending = await p.pendingListing.findMany()
    const listings = await p.listing.findMany({ include: { images: true } })
    const webhooks = await p.webhookEvent.findMany()
    console.log('pending:', JSON.stringify(pending, null, 2))
    console.log('listings:', JSON.stringify(listings, null, 2))
    console.log('webhooks:', JSON.stringify(webhooks, null, 2))
  } catch (e) {
    console.error(e)
  } finally {
    await p.$disconnect()
  }
})()
