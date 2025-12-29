# Builders Bargains — Production-ready scaffold

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

Files of interest:
- `prisma/schema.prisma` — DB schema (Postgres)
- `src/pages/api` — server endpoints (listings, auth, uploads)
- `src/lib/s3.ts` — S3 signed URL helpers
- `src/lib/square.ts` — Square checkout integration
 - `src/pages/api/payments/webhook.ts` — Square webhook endpoint to securely confirm payments

Next steps: wire up authentication (e.g., NextAuth), implement S3 uploads from client, and configure Square keys.

Webhooks: set `SQUARE_WEBHOOK_SIGNATURE_KEY` and configure your Square webhook to POST to `/api/payments/webhook`. The scaffold includes a basic HMAC-SHA256 verifier — adjust if Square uses a different header/value for your account.
