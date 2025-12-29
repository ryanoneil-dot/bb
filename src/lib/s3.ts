const REGION = process.env.AWS_REGION
const BUCKET = process.env.S3_BUCKET

// When AWS credentials + BUCKET are configured, dynamically use the AWS SDK v3 to produce
// presigned URLs and upload buffers. Otherwise fall back to a lightweight stub for local/dev.
export async function getPresignedUploadUrl(key: string, contentType = 'image/jpeg') {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && BUCKET && REGION) {
    // Lazy-import so we don't force the SDK install during tests or minimal dev runs.
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
    const client = new S3Client({ region: REGION })
    const command = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType })
    const url = await getSignedUrl(client, command, { expiresIn: 900 })
    return { url, method: 'PUT', headers: { 'Content-Type': contentType } }
  }

  // Fallback for local/dev/test: return a deterministic URL path the frontend can PUT to (or handle specially).
  const url = BUCKET && REGION ? `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}` : `/uploads/${key}`
  return { url, method: 'PUT', headers: { 'Content-Type': contentType } }
}

export async function uploadBuffer(key: string, buffer: Buffer, contentType = 'image/jpeg') {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && BUCKET && REGION) {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
    const client = new S3Client({ region: REGION })
    await client.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType }))
    return { success: true }
  }

  // No-op in test/dev — callers should handle absence of real S3.
  return { success: false, reason: 's3 not configured' }
}
