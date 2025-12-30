#!/usr/bin/env node
const { spawnSync } = require('child_process')

function run(cmd, args) {
  const bin = process.platform === 'win32' ? `${cmd}.cmd` : cmd
  const res = spawnSync(bin, args, { stdio: 'inherit' })
  if (res.status !== 0) process.exit(res.status || 1)
}

const port = process.env.PORT || '3000'

run('npx', ['prisma', 'generate'])
run('npx', ['prisma', 'migrate', 'deploy'])
run('npx', ['next', 'start', '-p', port])
