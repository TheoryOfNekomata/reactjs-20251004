import {describe, it, expect, beforeAll, afterAll, vi, Mock} from 'vitest';
import {FastifyInstance} from 'fastify';
import {createApp} from '../../src/app';
import * as pianoModule from '../../src/modules/piano';

vi.mock('../../src/modules/piano/service');

describe('Piano module', () => {
	let app: FastifyInstance;
	beforeAll(() => {
		app = createApp();

		pianoModule.routes.addToApp(app);
	});

	afterAll(async () => {
		await app.close();
	});

	describe('get pianos', () => {
		it('returns a collection of pianos', async () => {
			const mockQueryPianos = pianoModule.service.queryPianos as Mock;
			const mockReturn = {
				data: [],
				count: 0,
			};
			mockQueryPianos.mockReturnValueOnce(() => mockReturn);

			const response = await app.inject({
				method: 'GET',
				url: '/api/pianos',
				headers: {
					Accept: 'application/json',
				},
			});

			const data = response.json();
			expect(data).toBeInstanceOf(Array);
			expect(data).toHaveLength(mockReturn.data.length);
			const count = Number(response.headers['x-total-count']);
			expect(count).toBe(mockReturn.count);
		});
	});

	describe('get piano by ID', () => {
		it('returns a single piano', async () => {
			const mockGetPianoById = pianoModule.service.getPianoById as Mock;
			const mockReturn = {
				id: '1',
				model: 'Mock Model',
			};
			mockGetPianoById.mockReturnValueOnce(() => mockReturn);
			const mockGetPianoImages = pianoModule.service.getPianoImages as Mock;
			mockGetPianoImages.mockReturnValueOnce(() => []);

			const response = await app.inject({
				method: 'GET',
				url: `/api/pianos/${mockReturn.id}`,
				headers: {
					Accept: 'application/json',
				},
			});

			const data = response.json();
			expect(data.id).toBe(mockReturn.id);
			expect(data.images).toBeInstanceOf(Array);
		});
	});

	describe('create piano', () => {
		it('creates a new piano', async () => {
			const mockCreateNewPiano = pianoModule.service.createNewPiano as Mock;
			const newPiano = {
				id: '123',
				model: 'New Piano',
				created_at: new Date().toISOString()
			};
			mockCreateNewPiano.mockReturnValueOnce(() => newPiano);
			const mockCreatePianoImage = pianoModule.service.createPianoImage as Mock;
			mockCreatePianoImage.mockReturnValueOnce(() => ({
				id: '456',
				piano_id: newPiano.id,
				image_upload_id: 'upload789'
			}));

			const response = await app.inject({
				method: 'POST',
				url: '/api/pianos',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				payload: {
					model: 'New Piano',
					images: [
						{ upload_id: 'upload789' }
					]
				}
			});

			expect(response.statusCode).toBe(201);
			expect(response.headers.location).toBe(`/api/pianos/${newPiano.id}`);
			const data = response.json();
			expect(data.id).toBe(newPiano.id);
			expect(data.model).toBe(newPiano.model);
			expect(data.images).toHaveLength(1);
			expect(data.images[0].piano_id).toBe(newPiano.id);
		});
	});

	describe('delete piano', () => {
		it('successfully deletes a piano', async () => {
			const mockDeletePiano = pianoModule.service.deletePiano as Mock;
			mockDeletePiano.mockReturnValueOnce(() => true);

			const response = await app.inject({
				method: 'DELETE',
				url: '/api/pianos/123',
				headers: {
					Accept: 'application/json',
				},
			});

			expect(response.statusCode).toBe(204);
			expect(response.body).toBe('');
		});

		it('returns 404 when piano not found', async () => {
			const mockDeletePiano = pianoModule.service.deletePiano as Mock;
			mockDeletePiano.mockReturnValueOnce(() => false);

			const response = await app.inject({
				method: 'DELETE',
				url: '/api/pianos/non-existent',
				headers: {
					Accept: 'application/json',
				},
			});

			expect(response.statusCode).toBe(404);
		});
	});

	describe('update piano', () => {
		it('successfully updates a piano', async () => {
			const updatedPiano = {
				id: '123',
				model: 'Updated Piano Model',
				created_at: new Date().toISOString()
			};
			const mockUpdatePianoModel = pianoModule.service.updatePianoModel as Mock;
			mockUpdatePianoModel.mockReturnValueOnce(() => () => updatedPiano);

			const response = await app.inject({
				method: 'PATCH',
				url: '/api/pianos/123',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				payload: {
					model: 'Updated Piano Model'
				}
			});

			expect(response.statusCode).toBe(200);
			const data = response.json();
			expect(data.id).toBe(updatedPiano.id);
			expect(data.model).toBe(updatedPiano.model);
		});

		it('returns 500 when update fails', async () => {
			const mockUpdatePianoModel = pianoModule.service.updatePianoModel as Mock;
			mockUpdatePianoModel.mockReturnValueOnce(() => () => undefined);

			const response = await app.inject({
				method: 'PATCH',
				url: '/api/pianos/123',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				payload: {
					model: 'Updated Piano Model'
				}
			});

			expect(response.statusCode).toBe(500);
		});
	});

	describe('create piano image', () => {
		it('successfully creates a piano image', async () => {
			const pianoImage = {
				id: '456',
				piano_id: '123',
				image_upload_id: 'upload789'
			};
			const mockCreatePianoImage = pianoModule.service.createPianoImage as Mock;
			mockCreatePianoImage.mockReturnValueOnce(() => pianoImage);

			const response = await app.inject({
				method: 'POST',
				url: '/api/pianos/123/images',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				payload: {
					upload_id: 'upload789'
				}
			});

			expect(response.statusCode).toBe(200);
			expect(response.headers.location).toBe(`/api/pianos/123/images/${pianoImage.id}`);
			const data = response.json();
			expect(data.id).toBe(pianoImage.id);
			expect(data.piano_id).toBe(pianoImage.piano_id);
			expect(data.image_upload_id).toBe(pianoImage.image_upload_id);
		});

		it('returns 500 when image creation fails', async () => {
			const mockCreatePianoImage = pianoModule.service.createPianoImage as Mock;
			mockCreatePianoImage.mockReturnValueOnce(() => undefined);

			const response = await app.inject({
				method: 'POST',
				url: '/api/pianos/123/images',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				payload: {
					upload_id: 'upload789'
				}
			});

			expect(response.statusCode).toBe(500);
		});
	});

	describe('delete piano image', () => {
		it('successfully deletes a piano image', async () => {
			const mockDeletePianoImage = pianoModule.service.deletePianoImage as Mock;
			mockDeletePianoImage.mockReturnValueOnce(() => true);

			const response = await app.inject({
				method: 'DELETE',
				url: '/api/pianos/123/images/456',
				headers: {
					Accept: 'application/json',
				},
			});

			expect(response.statusCode).toBe(204);
			expect(response.body).toBe('');
		});

		it('returns 404 when piano image not found', async () => {
			const mockDeletePianoImage = pianoModule.service.deletePianoImage as Mock;
			mockDeletePianoImage.mockReturnValueOnce(() => false);

			const response = await app.inject({
				method: 'DELETE',
				url: '/api/pianos/123/images/non-existent',
				headers: {
					Accept: 'application/json',
				},
			});

			expect(response.statusCode).toBe(404);
		});
	});
});
