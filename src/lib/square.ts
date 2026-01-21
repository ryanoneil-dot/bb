// Runtime-aware Square helper. If `SQUARE_ACCESS_TOKEN` is present and `@square/square`
// SDK is installed, it will be used. Otherwise a lightweight stub is returned for local/dev.
export async function createCheckoutLink(amountPence: number, redirectUrl: string, referenceId?: string) {
  if (!process.env.SQUARE_ACCESS_TOKEN || !process.env.SQUARE_LOCATION_ID) {
    throw new Error('Square is not configured')
  }

  const { Client, Environment } = await import('@square/square')
  const env = process.env.SQUARE_ENV === 'sandbox' ? Environment.Sandbox : Environment.Production
  const client = new Client({ accessToken: process.env.SQUARE_ACCESS_TOKEN, environment: env })
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
  const orderResp = await client.ordersApi.createOrder({
    order: orderBody.order,
    idempotencyKey: orderBody.idempotencyKey,
  } as any)
  const orderId = orderResp?.result?.order?.id
  const checkoutResp = await client.checkoutApi.createCheckout(process.env.SQUARE_LOCATION_ID, {
    idempotencyKey: referenceId || `${Date.now()}`,
    order: { id: orderId },
    redirectUrl,
  } as any)
  return checkoutResp.result || { checkout: { checkoutPageUrl: checkoutResp?.result?.checkout?.checkoutPageUrl || '' } }
}
