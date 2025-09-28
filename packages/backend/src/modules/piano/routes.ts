import {FastifyInstance} from 'fastify';
import {
	queryPianos,
	CreatePiano,
	createNewPiano,
	deletePiano,
	UpdatePianoModelPiano,
	updatePianoModel, getPianoById, getPianoImages, deletePianoImage, createPianoImage,
} from './service';
import {Database} from 'better-sqlite3';
import {Piano, PianoImage, Upload} from '../../models';

export const addRoutes = (db: Database) => (fastify: FastifyInstance) => {
	return fastify
		.route<{
			Querystring: {
				c?: number;
				p?: number;
				q?: string;
			}
		}>({
			method: 'GET',
			url: '/api/pianos',
			handler: async (request, reply) => {
				const { c: itemsPerPage = 10, p: page = 1, q: query = '' } = request.query;
				const { data, count } = queryPianos(db)({
					itemsPerPage: Number(itemsPerPage),
					page: Number(page),
					query,
				});
				reply.header('X-Total-Count', count).send(data);
			},
		})
		.route<{
			Params: {
				pianoId: Piano['id'],
			}
		}>({
			method: 'GET',
			url: '/api/pianos/:pianoId',
			handler: async (request, reply) => {
				const piano = getPianoById(db)(request.params.pianoId);
				if (!piano) {
					reply.status(404).send();
					return;
				}
				const images = getPianoImages(db)(request.params.pianoId);
				reply.send({
					...piano,
					images,
				});
			},
		})
		.route<{
			Body: CreatePiano & {
				images?: {
					upload_id: Upload['id'];
				}[]
			}
		}>({
			method: 'POST',
			url: '/api/pianos',
			handler: async (request, reply) => {
				const { images = [], ...pianoData } = request.body;
				const newPiano = createNewPiano(db)(pianoData);
				if (!newPiano) {
					reply.status(500).send();
					return;
				}
				const successfulImages = [];
				for (const image of images) {
					const pianoImage = createPianoImage(db)(newPiano.id, image.upload_id);
					if (!pianoImage) {
						reply.status(500).send();
						return;
					}
					successfulImages.push(pianoImage);
				}
				reply.header('Location', `/api/pianos/${newPiano.id}`).status(201).send({
					...newPiano,
					images: successfulImages,
				});
			},
		})
		.route<{
			Params: {
				pianoId: Piano['id'],
			}
		}>({
			method: 'DELETE',
			url: '/api/pianos/:pianoId',
			handler: async (request, reply) => {
				try {
					const result = deletePiano(db)(request.params.pianoId);
					if (!result) {
						reply.status(404).send();
						return;
					}
					reply.status(204).send();
				} catch {
					reply.status(500).send();
				}
			},
		})
		.route<{
			Params: {
				pianoId: Piano['id'],
			},
			Body: UpdatePianoModelPiano
		}>({
			method: 'PATCH',
			url: '/api/pianos/:pianoId',
			handler: async (request, reply) => {
				const updatedPiano = updatePianoModel(db)(request.params.pianoId)(request.body);
				if (!updatedPiano) {
					reply.status(500).send();
					return;
				}
				reply.send(updatedPiano);
			},
		})
		.route<{
			Params: {
				pianoId: PianoImage['piano_id'];
			},
			Body: {
				upload_id: PianoImage['image_upload_id'];
			}
		}>({
			method: 'POST',
			url: '/api/pianos/:pianoId/images',
			handler: async (request, reply) => {
				const pianoImage = createPianoImage(db)(request.params.pianoId, request.body.upload_id);
				if (!pianoImage) {
					reply.status(500).send();
					return;
				}

				reply.header('Location', `/api/pianos/${request.params.pianoId}/images/${pianoImage.id}`).send(pianoImage);
			},
		})
		.route<{
			Params: {
				pianoId: PianoImage['piano_id'],
				imageId: PianoImage['id'],
			}
		}>({
			method: 'DELETE',
			url: '/api/pianos/:pianoId/images/:imageId',
			handler: async (request, reply) => {
				try {
					const result = deletePianoImage(db)(request.params.imageId);
					if (!result) {
						reply.status(404).send();
						return;
					}
					reply.status(204).send();
				} catch {
					reply.status(500).send();
				}
			},
		});
};
