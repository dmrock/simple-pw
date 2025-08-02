import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import { testRunsRoutes } from './routes/test-runs.js';

const fastify = Fastify({
  logger: true
});

const prisma = new PrismaClient();

// Plugins
await fastify.register(cors, {
  origin: true
});

// Add prisma to fastify instance
fastify.decorate('prisma', prisma);

// Routes
await fastify.register(testRunsRoutes, { prefix: '/api' });

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 API Server running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();