// Runtime-aware Square helper. If `SQUARE_ACCESS_TOKEN` is present and `@square/square`
// SDK is installed, it will be used. Otherwise a lightweight stub is returned for local/dev.
export async function createCheckoutLink(amountPence: number, redirectUrl: string, referenceId?: string) {
  if (process.env.SQUARE_ACCESS_TOKEN) {
    try {
      const { Client, Environment } = await import('@square/square')
      const client = new Client({ accessToken: process.env.SQUARE_ACCESS_TOKEN, environment: Environment.Sandbox })
      // Create an order first, then create a checkout tied to that order. Use pending.id as idempotency key.
      const orderBody = {
        idempotencyKey: referenceId || `${Date.now()}`,
        order: {
          locationId: process.env.SQUARE_LOCATION_ID,
          lineItems: [
            { name: 'Listing fee', quantity: '1', basePriceMoney: { amount: amountPence, currency: 'GBP' } },
          ],
        },
      }
      const orderResp = await client.ordersApi.createOrder({ order: orderBody.order, idempotencyKey: orderBody.idempotencyKey } as any).catch((e: any) => { throw e })
      const orderId = orderResp?.result?.order?.id
      const checkoutResp = await client.checkoutApi.createCheckout(process.env.SQUARE_LOCATION_ID as string, {
        idempotencyKey: referenceId || `${Date.now()}`,
        order: { id: orderId },
        redirectUrl,
      } as any)
      return checkoutResp.result || { checkout: { checkoutPageUrl: checkoutResp?.result?.checkout?.checkoutPageUrl || '' } }
    } catch (e) {
      // If SDK isn't installed or call fails, fall back to stub below.
      console.warn('Square SDK unavailable or failed, falling back to mock checkout', e)
    }
  }

  const base = process.env.MOCK_CHECKOUT_URL || 'https://square.link/u/mock'
  const url = `${base}?redirect=${encodeURIComponent(redirectUrl)}${referenceId ? `&ref=${encodeURIComponent(referenceId)}` : ''}`
  return { checkout: { checkoutPageUrl: url } }
}
