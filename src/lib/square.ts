// Runtime-aware Square helper. If `SQUARE_ACCESS_TOKEN` is present and `@square/square`
// SDK is installed, it will be used. Otherwise a lightweight stub is returned for local/dev.
export async function createCheckoutLink(amountPence: number, redirectUrl: string, referenceId?: string) {
  if (process.env.SQUARE_ACCESS_TOKEN) {
    try {
      const { Client, Environment } = await import('@square/square')
      const client = new Client({ accessToken: process.env.SQUARE_ACCESS_TOKEN, environment: Environment.Sandbox })
      const body: any = {
        idempotency_key: referenceId || `${Date.now()}`,
        order: {
          order: { location_id: process.env.SQUARE_LOCATION_ID },
        },
      }
      // This is a lightweight attempt; integrate properly with Orders/Checkout API per Square docs.
      const resp = await client.checkoutApi.createCheckout(process.env.SQUARE_LOCATION_ID as string, {
        idempotencyKey: referenceId || `${Date.now()}`,
        order: { locationId: process.env.SQUARE_LOCATION_ID },
        redirectUrl,
        prePopulatedData: { referenceId },
      } as any)
      return resp.result || { checkout: { checkoutPageUrl: resp?.result?.checkout?.checkoutPageUrl || '' } }
    } catch (e) {
      // If SDK isn't installed or call fails, fall back to stub below.
      console.warn('Square SDK unavailable or failed, falling back to mock checkout', e)
    }
  }

  const base = process.env.MOCK_CHECKOUT_URL || 'https://square.link/u/mock'
  const url = `${base}?redirect=${encodeURIComponent(redirectUrl)}${referenceId ? `&ref=${encodeURIComponent(referenceId)}` : ''}`
  return { checkout: { checkoutPageUrl: url } }
}
