// Lightweight stub for Square checkout creation so we don't require the Square SDK during local tests.
export async function createCheckoutLink(_amountPence: number, redirectUrl: string, referenceId?: string) {
  // Return a minimal shape matching the real Square SDK response used by the app.
  const base = process.env.MOCK_CHECKOUT_URL || 'https://square.link/u/mock'
  const url = `${base}?redirect=${encodeURIComponent(redirectUrl)}${referenceId ? `&ref=${encodeURIComponent(referenceId)}` : ''}`
  return { checkout: { checkoutPageUrl: url } }
}
