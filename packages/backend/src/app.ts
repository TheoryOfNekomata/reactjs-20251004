import {fastify} from 'fastify';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import {fastifyMultipart} from '@fastify/multipart';
import {join} from 'node:path';
import {Database} from 'better-sqlite3';
import {fastifyCors} from '@fastify/cors';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
    uploadsDir: string;
  }
}

interface CreateAppOptions {
  database?: Database;
  uploadsDir?: string;
  corsAllowedOrigins?: string[];
  maxUploadFileSize?: number;
}

export const createApp = (opts = {} as CreateAppOptions) => {
  const { database, uploadsDir = '/uploads', corsAllowedOrigins, maxUploadFileSize = 5 * 1024 * 1024 } = opts;

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
  if (Array.isArray(corsAllowedOrigins)) {
    app.register(fastifyCors, {
      origin: corsAllowedOrigins,
    });
  }

  // Register multipart plugin
  app.register(fastifyMultipart, {
    limits: {
      fieldNameSize: 100, // Max field name size in bytes
      fieldSize: 0, // Max field value size in bytes
      fields: 0, // Max number of non-file fields
      fileSize: maxUploadFileSize, // 5MB limit for file uploads
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
