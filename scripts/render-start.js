#!/usr/bin/env node
const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function run(cmd, args) {
  const bin = process.platform === 'win32' ? `${cmd}.cmd` : cmd
  const res = spawnSync(bin, args, { stdio: 'inherit' })
  if (res.status !== 0) process.exit(res.status || 1)
}

const port = process.env.PORT || '3000'

const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations')
if (fs.existsSync(migrationsDir)) {
  const entries = fs.readdirSync(migrationsDir).filter((name) => !name.startsWith('.'))
  console.log(`Migrations found: ${entries.length}`)
} else {
  console.log('Migrations directory not found')
}

run('npx', ['prisma@5.4.0', 'generate', '--schema=prisma/schema.prisma'])
run('npx', ['prisma@5.4.0', 'migrate', 'deploy', '--schema=prisma/schema.prisma'])
run('npx', ['prisma@5.4.0', 'migrate', 'status', '--schema=prisma/schema.prisma'])
run('npx', ['next', 'start', '-p', port])
