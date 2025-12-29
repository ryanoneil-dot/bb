# Builders Bargains — Production-ready scaffold

![CI](https://github.com/ryanoneil-dot/bb/actions/workflows/ci.yml/badge.svg)

This repository is a production-ready scaffold for Builders Bargains: a local marketplace for builders and tradespeople in Southport, UK.

Quick setup (development):

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:

```bash
npm install
npx prisma generate
```

3. Start Postgres (docker-compose):

```bash
docker compose up -d
```

4. Run migrations and dev server:

```bash
npm run prisma:migrate
npm run dev
```

S3 / Square (optional production setup):

- Install AWS + Square SDKs if you plan to use real services:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @square/square
```

- Set environment variables (example `.env` values):

```
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-west-2
S3_BUCKET=your-bucket-name
NEXT_PUBLIC_S3_BASE_URL=https://your-bucket-name.s3.eu-west-2.amazonaws.com

SQUARE_ACCESS_TOKEN=...
SQUARE_LOCATION_ID=...
SQUARE_WEBHOOK_SIGNATURE_KEY=...
```

The app will lazily import the SDKs at runtime if these env vars are present; otherwise it falls back to local stubs for development and testing.

Admin and moderation:

- Set `ADMIN_EMAILS` in your `.env` to a comma-separated list of admin emails, e.g. `ADMIN_EMAILS=you@example.com`
- Admins can view reports at `/admin/reports`.

Promo assets:

- A plain text promo is available at `/promo.txt` and a sample is included in `public/promo.txt`.

Files of interest:
- `prisma/schema.prisma` — DB schema (Postgres)
- `src/pages/api` — server endpoints (listings, auth, uploads)
- `src/lib/s3.ts` — S3 signed URL helpers
- `src/lib/square.ts` — Square checkout integration
 - `src/pages/api/payments/webhook.ts` — Square webhook endpoint to securely confirm payments

Next steps: wire up authentication (e.g., NextAuth), implement S3 uploads from client, and configure Square keys.

Webhooks: set `SQUARE_WEBHOOK_SIGNATURE_KEY` and configure your Square webhook to POST to `/api/payments/webhook`. The scaffold includes a basic HMAC-SHA256 verifier — adjust if Square uses a different header/value for your account.
