#!/usr/bin/env node
// Simple local worker to process images: downloads object from S3, creates variants, uploads back.
const fs = require('fs')
const path = require('path')
;(async () => {
  const key = process.argv[2]
  if (!key) {
    console.error('Usage: node src/api-image-worker.js <s3-key>')
    process.exit(1)
  }
  try {
    const sharp = require('sharp')
    const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
    const REGION = process.env.AWS_REGION
    const BUCKET = process.env.S3_BUCKET
    if (!REGION || !BUCKET) throw new Error('S3 not configured')
    const client = new S3Client({ region: REGION })
    const get = await client.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
    const chunks = []
    for await (const chunk of get.Body) chunks.push(chunk)
    const buf = Buffer.concat(chunks)
    const sizes = [320, 640]
    for (const w of sizes) {
      const out = await sharp(buf).resize(w).jpeg({ quality: 80 }).toBuffer()
      const outKey = key.replace(/(\.[^.]+)$/, `-${w}$1`)
      await client.send(new PutObjectCommand({ Bucket: BUCKET, Key: outKey, Body: out, ContentType: 'image/jpeg' }))
      console.log('Uploaded', outKey)
    }
  } catch (err) {
    console.error('worker error', err)
    process.exit(1)
  }
})()
