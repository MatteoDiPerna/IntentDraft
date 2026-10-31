/**
 * PM2 — IntentDraft (dev)
 *
 * Avvio (dalla root):
 *   npx pm2 start ecosystem.config.cjs
 *
 * Riavvio API + frontend (PM2 nativo, namespace):
 *   npx pm2 restart intentdraft --update-env
 *
 * Dopo pull con migrazioni Prisma:
 *   npx pm2 stop intentdraft-api
 *   cd backend && npx prisma migrate deploy && npx prisma generate
 *   cd .. && npx pm2 restart intentdraft --update-env
 *
 * Oppure:
 *   npx pm2 restart ecosystem.config.cjs --update-env
 */
const path = require('path');

const root = __dirname;
const ns = 'intentdraft';

module.exports = {
  apps: [
    {
      name: 'intentdraft-api',
      namespace: ns,
      cwd: path.join(root, 'backend'),
      script: path.join(root, 'backend/node_modules/tsx/dist/cli.mjs'),
      // No `tsx watch` here: hot reload can leave ESM half-loaded (admin/llm imports). PM2 restarts on crash.
      args: 'src/index.ts',
      interpreter: 'node',
      autorestart: true,
      max_restarts: 15,
      min_uptime: '5s',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
    },
    {
      name: 'intentdraft-web',
      namespace: ns,
      cwd: path.join(root, 'frontend'),
      script: path.join(root, 'frontend/node_modules/vite/bin/vite.js'),
      args: '',
      interpreter: 'node',
      autorestart: true,
      max_restarts: 15,
      min_uptime: '5s',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
