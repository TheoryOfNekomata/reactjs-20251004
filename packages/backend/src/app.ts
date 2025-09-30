import {fastify} from 'fastify';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import fastifyMultipart from '@fastify/multipart';
import {join} from 'node:path';
import {Database} from 'better-sqlite3';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
    uploadsDir: string;
  }
}

interface CreateAppOptions {
  database?: Database;
  uploadsDir?: string;
}

export const createApp = (opts = {} as CreateAppOptions) => {
  const { database, uploadsDir = '/uploads' } = opts;

  const packageJson = readFileSync('package.json', { encoding: 'utf-8' });
  const packageJsonData = JSON.parse(packageJson);
  const rootData = {
    name: packageJsonData.name,
    version: packageJsonData.version,
  };

  // Ensure uploads directory exists

  const app = fastify();
  if (database) {
    app.decorate('db', database);
  }

  const trueUploadsDir = join(process.cwd(), uploadsDir);
  if (!existsSync(trueUploadsDir)) {
    mkdirSync(trueUploadsDir, { recursive: true });
  }
  app.decorate('uploadsDir', uploadsDir);

  // Register multipart plugin
  app.register(fastifyMultipart, {
    limits: {
      fieldNameSize: 100, // Max field name size in bytes
      fieldSize: 100, // Max field value size in bytes
      fields: 10, // Max number of non-file fields
      fileSize: 5 * 1024 * 1024, // 5MB limit for file uploads
      files: 1, // Max number of file fields
    }
  });

  app.route({
    method: 'GET',
    url: '/api',
    handler: async (request, reply) => {
      reply.send(rootData)
    },
  })

  return app;
};
