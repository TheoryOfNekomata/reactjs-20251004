import {Database} from 'better-sqlite3';
import {FastifyInstance} from 'fastify';
import {createUpload, deleteUpload, getUploadById} from './service';
import {Upload} from '../../models';
import {join} from 'node:path';
import {createReadStream} from 'node:fs';

export const addRoutes = (db: Database, basePath: string) => (fastify: FastifyInstance) => {
	const trueBasePath = join(process.cwd(), basePath)
	return fastify
		.route({
			method: 'POST',
			url: '/api/uploads',
			handler: async (request, reply) => {
				const file = await request.file();

				if (!file) {
					reply.status(400).send();
					return;
				}

				const result = await createUpload(db, trueBasePath)(file);

				if (!result) {
					reply.status(400).send();
					return;
				}

				reply
					.status(201)
					.header('Location', `/api/uploads/${result.id}`)
					.send(result);
			},
		})
		.route<{
			Params: {
				uploadId: Upload['id'],
			},
		}>({
			method: 'GET',
			url: '/api/uploads/:uploadId',
			handler: async (request, reply) => {
				const upload = getUploadById(db)(request.params.uploadId);
				if (!upload) {
					reply.status(404).send();
					return;
				}

				reply.send(upload);
			},
		})
		.route<{
			Params: {
				uploadId: Upload['id'],
			},
		}>({
			method: 'DELETE',
			url: '/api/uploads/:uploadId',
			handler: async (request, reply) => {
				try {
					const result = deleteUpload(db, trueBasePath)(request.params.uploadId);
					if (!result) {
						reply.status(404).send();
						return;
					}
					reply.status(204).send();
				} catch (e) {
					console.error(e);
					reply.status(500).send();
				}
			},
		})
		.route<{
			Params: {
				uploadId: Upload['id'],
			},
		}>({
			method: 'GET',
			url: '/api/uploads/:uploadId/binary',
			handler: async (request, reply) => {
				const upload = getUploadById(db)(request.params.uploadId);
				if (!upload) {
					reply.status(404).send();
					return;
				}

				const readStream = createReadStream(join(trueBasePath, upload.id))
				reply.header('Content-Type', upload.mimetype);
				return reply.send(readStream);
			},
		});
};
