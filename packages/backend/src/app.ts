import {fastify} from 'fastify';
import * as pianoModule from './modules/piano';
import * as uploadModule from './modules/upload';
import Database from 'better-sqlite3';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import fastifyMultipart from '@fastify/multipart';
import {join} from 'node:path';

interface AppOptions {
  databaseFilename?: string;
}

export const app = (opts = {
  databaseFilename: ':memory:',
} as AppOptions) => {
  const db = new Database(opts.databaseFilename);
  const schema = readFileSync('src/schema.sql', { encoding: 'utf-8' });
  db.exec(schema);

  const packageJson = readFileSync('package.json', { encoding: 'utf-8' });
  const packageJsonData = JSON.parse(packageJson);
  const rootData = {
    name: packageJsonData.name,
    version: packageJsonData.version,
  };

  // Ensure uploads directory exists
  const uploadsDir = '/uploads';
  const trueUploadsDir = join(process.cwd(), uploadsDir);
  if (!existsSync(trueUploadsDir)) {
    mkdirSync(trueUploadsDir, { recursive: true });
  }

  const f = fastify();

  // Register multipart plugin
  f.register(fastifyMultipart, {
    limits: {
      fieldNameSize: 100, // Max field name size in bytes
      fieldSize: 100, // Max field value size in bytes
      fields: 10, // Max number of non-file fields
      fileSize: 5 * 1024 * 1024, // 5MB limit for file uploads
      files: 1, // Max number of file fields
    }
  });

  pianoModule.routes.addRoutes(db)(f);
  uploadModule.routes.addRoutes(db, uploadsDir)(f);

  f.route({
    method: 'GET',
    url: '/api',
    handler: async (request, reply) => {
      reply.send(rootData)
    },
  })

  return f;
};
