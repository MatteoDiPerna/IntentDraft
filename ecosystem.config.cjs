/**
 * PM2 — IntentDraft stack (dev)
 *
 * Usage (from repo root):
 *   npm run pm2:start
 *   npm run pm2:restart
 *   npm run pm2:stop
 *   npm run pm2:logs
 */
const path = require('path');

const root = __dirname;

module.exports = {
  apps: [
    {
      name: 'intentdraft-api',
      cwd: path.join(root, 'backend'),
      script: path.join(root, 'backend/node_modules/tsx/dist/cli.mjs'),
      args: 'watch src/index.ts',
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
