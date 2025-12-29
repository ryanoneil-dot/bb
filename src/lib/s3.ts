const REGION = process.env.AWS_REGION
const BUCKET = process.env.S3_BUCKET

// Lightweight stubs so project can run without installing @aws-sdk in local/dev/test.
export async function getPresignedUploadUrl(key: string, contentType = 'image/jpeg') {
  // If real S3 is configured, the app can replace this with presigned URL generation.
  const url = BUCKET && REGION ? `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}` : `/uploads/${key}`
  return { url, method: 'PUT', headers: { 'Content-Type': contentType } }
}

export async function uploadBuffer(_key: string, _buffer: Buffer, _contentType = 'image/jpeg') {
  // In local/test environments this is a no-op stub. Replace with real S3 upload when configured.
  throw new Error('uploadBuffer not implemented — configure S3 or replace `src/lib/s3.ts`')
}
