import {join} from 'node:path';
import {createReadStream} from 'node:fs';
import {FastifyInstance} from 'fastify';
import {Upload} from '../../models';
import {createUpload, deleteUpload, getUploadById} from './service';
import {MultipartFile} from '@fastify/multipart';

export const addToApp = (fastify: FastifyInstance) => {
	const trueBasePath = join(process.cwd(), fastify.uploadsDir)
	return fastify
		.route({
			method: 'POST',
			url: '/api/uploads',
			handler: async (request, reply) => {
				let file: MultipartFile | undefined;
				try {
					file = await request.file();
				} catch {
					reply.status(400).send();
					return;
				}

				if (!file) {
					reply.status(400).send();
					return;
				}

				const result = await createUpload(request.server.db, trueBasePath)(file);
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
				const upload = getUploadById(request.server.db)(request.params.uploadId);
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
					const result = deleteUpload(request.server.db, trueBasePath)(request.params.uploadId);
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
				const upload = getUploadById(request.server.db)(request.params.uploadId);
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
