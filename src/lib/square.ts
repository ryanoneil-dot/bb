// Runtime-aware Square helper using direct API calls (no SDK dependency).
export async function createCheckoutLink(amountPence: number, redirectUrl: string, referenceId?: string) {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN
  const locationId = process.env.SQUARE_LOCATION_ID
  if (!accessToken || !locationId) {
    throw new Error('Square is not configured')
  }

  const baseUrl = process.env.SQUARE_ENV === 'sandbox' ? 'https://connect.squareupsandbox.com' : 'https://connect.squareup.com'
  const idempotencyKey = referenceId || `${Date.now()}`
  const body = {
    idempotency_key: idempotencyKey,
    order: {
      location_id: locationId,
      line_items: [
        {
          name: 'Listing fee',
          quantity: '1',
          base_price_money: { amount: amountPence, currency: 'GBP' },
        },
      ],
    },
    checkout_options: {
      redirect_url: redirectUrl,
    },
  }

  const resp = await fetch(`${baseUrl}/v2/online-checkout/payment-links`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Square-Version': '2024-02-21',
    },
    body: JSON.stringify(body),
  })

  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) {
    const message = data?.errors?.[0]?.detail || 'Square checkout error'
    throw new Error(message)
  }

  const url = data?.payment_link?.url || data?.payment_link?.checkout_page_url
  if (!url) throw new Error('Square checkout URL missing')
  return { checkout: { checkoutPageUrl: url } }
}
