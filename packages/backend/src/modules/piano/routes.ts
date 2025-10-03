import {FastifyInstance} from 'fastify';
import {Piano, PianoImage, Upload} from '../../models';
import * as service from './service';

export const addToApp = (fastify: FastifyInstance) => {
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
			handler: (request, reply) => {
				const { c: itemsPerPage = 12, p: page = 1, q: query = '' } = request.query;
				const { data, count } = service.queryPianos(request.server.db)({
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
			handler: (request, reply) => {
				const piano = service.getPianoById(request.server.db)(request.params.pianoId);
				if (!piano) {
					reply.status(404).send();
					return;
				}
				const images = service.getPianoImages(request.server.db)(request.params.pianoId);
				reply.send({
					...piano,
					images,
				});
			},
		})
		.route<{
			Body: service.CreatePiano & {
				images?: {
					upload_id: Upload['id'];
				}[]
			}
		}>({
			method: 'POST',
			url: '/api/pianos',
			handler: (request, reply) => {
				const { images = [], ...pianoData } = request.body;
				const newPiano = service.createNewPiano(request.server.db)(pianoData);
				if (!newPiano) {
					reply.status(500).send();
					return;
				}
				const successfulImages = [];
				for (const image of images) {
					const pianoImage = service.createPianoImage(request.server.db)(newPiano.id, image.upload_id);
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
			handler: (request, reply) => {
				try {
					const result = service.deletePiano(request.server.db)(request.params.pianoId);
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
			Body: service.UpdatePianoModelData | service.UpdatePianoDescriptionData
		}>({
			method: 'PATCH',
			url: '/api/pianos/:pianoId',
			handler: (request, reply) => {
				let updatedPiano = null;

				if ('model' in request.body) {
					updatedPiano = service.updatePianoModel(request.server.db)(request.params.pianoId)(request.body);
					console.log('model', updatedPiano);
				}
				if ('description' in request.body) {
					updatedPiano = service.updatePianoDescription(request.server.db)(request.params.pianoId)(request.body);
					console.log('description', updatedPiano);
				}

				if (updatedPiano === null) {
					reply.status(400).send();
					return;
				}

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
			handler: (request, reply) => {
				const pianoImage = service.createPianoImage(request.server.db)(request.params.pianoId, request.body.upload_id);
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
			handler: (request, reply) => {
				try {
					const result = service.deletePianoImage(request.server.db)(request.params.imageId);
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
