import { FastifyInstance } from 'fastify';
import { z, ZodError } from 'zod';
import { Prisma } from '@prisma/client';

// Validation schemas
const testResultSchema = z.object({
  id: z.string(),
  runId: z.string(),
  testName: z.string(),
  fileName: z.string(),
  status: z.enum(['passed', 'failed', 'skipped', 'timedOut']),
  duration: z.number(),
  error: z.string().optional(),
  retry: z.number(),
  screenshots: z.array(z.string()),
  videos: z.array(z.string()),
});

const testRunSchema = z.object({
  id: z.string(),
  projectName: z.string(),
  branch: z.string().optional(),
  commit: z.string().optional(),
  timestamp: z.string().transform((str) => new Date(str)),
  status: z.enum(['passed', 'failed', 'skipped']),
  duration: z.number(),
  metadata: z.record(z.unknown()).optional(),
});

const createTestRunSchema = z.object({
  run: testRunSchema,
  results: z.array(testResultSchema),
});

export async function testRunsRoutes(fastify: FastifyInstance) {
  // Create new test run with results
  fastify.post('/test-runs', async (request, reply) => {
    try {
      console.log(
        '📥 Received request body:',
        JSON.stringify(request.body, null, 2)
      );

      const { run, results } = createTestRunSchema.parse(request.body);

      // Convert metadata to Prisma's JsonValue type, ensuring null instead of undefined
      const metadata:
        | Prisma.InputJsonValue
        | Prisma.NullableJsonNullValueInput = run.metadata
        ? (run.metadata as Prisma.InputJsonValue)
        : Prisma.DbNull;

      // Save test run
      const savedRun = await fastify.prisma.testRun.create({
        data: {
          id: run.id,
          projectName: run.projectName,
          branch: run.branch ?? null,
          commit: run.commit ?? null,
          timestamp: run.timestamp,
          status: run.status,
          duration: run.duration,
          metadata: metadata,
          results: {
            create: results.map((result) => ({
              id: result.id,
              testName: result.testName,
              fileName: result.fileName,
              status: result.status,
              duration: result.duration,
              error: result.error ?? null, // Convert undefined to null
              retry: result.retry,
              screenshots: result.screenshots,
              videos: result.videos,
            })),
          },
        },
        include: {
          results: true,
        },
      });

      reply.code(201).send(savedRun);
    } catch (error) {
      console.error('❌ Validation error:', error);
      fastify.log.error(error);

      // If it's a Zod validation error, return detailed info
      if (error instanceof ZodError) {
        reply.code(400).send({
          error: 'Validation failed',
          details: error.issues,
        });
      } else {
        reply.code(400).send({ error: 'Invalid request data' });
      }
    }
  });

  // Get test runs with pagination
  fastify.get('/test-runs', async (request, reply) => {
    interface TestRunsQuery {
      page?: string;
      limit?: string;
    }
    const { page = '1', limit = '20' } = request.query as TestRunsQuery;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    // Get total count
    const total = await fastify.prisma.testRun.count();

    // Get paginated runs
    const runs = await fastify.prisma.testRun.findMany({
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { timestamp: 'desc' },
      include: {
        results: true,
      },
    });

    const totalPages = Math.ceil(total / limitNum);

    reply.send({
      data: runs,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    });
  });

  // Get specific test run
  fastify.get('/test-runs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const run = await fastify.prisma.testRun.findUnique({
      where: { id },
      include: {
        results: true,
      },
    });

    if (!run) {
      reply.code(404).send({ error: 'Test run not found' });
      return;
    }

    reply.send(run);
  });
}
