import type { FastifyInstance } from 'fastify';
import { pingDatabase } from '../../lib/db.js';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/api/health', async () => {
    const db = await pingDatabase();
    return { ok: true, db };
  });
}
