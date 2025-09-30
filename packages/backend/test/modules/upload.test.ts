import { Readable } from 'node:stream';
import { describe, it, expect, beforeAll, afterAll, vi, Mock } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createApp } from '../../src/app';
import * as uploadModule from '../../src/modules/upload';

vi.mock('../../src/modules/upload/service');

vi.mock('node:fs', () => ({
	readFileSync: vi.fn((path) => {
		if (path === 'package.json') {
			return JSON.stringify({
				name: 'test',
				version: '0.0.0',
			});
		}
		return '';
	}),
	existsSync: vi.fn(() => true),
	createReadStream: vi.fn(() => Readable.from(['mock image content'])),
}));

describe('Upload module', () => {
	let app: FastifyInstance;
	beforeAll(() => {
		app = createApp();

		uploadModule.routes.addToApp(app);
	});

	afterAll(async () => {
		await app.close();
	});

	describe('create upload', () => {
		it('successfully creates a new upload', async () => {
			const mockCreateUpload = uploadModule.service.createUpload as Mock;
			const newUpload = {
				id: 'upload123',
				original_filename: 'test-image.jpg',
				mimetype: 'image/jpeg',
				created_at: new Date().toISOString()
			};
			mockCreateUpload.mockReturnValueOnce(() => Promise.resolve(newUpload));
			const payload = new FormData();
			payload.append('file', new File(['mock image content'], 'test-image.jpg', {
				type: 'image/jpeg',
			}));

			const response = await app.inject({
				method: 'POST',
				url: '/api/uploads',
				headers: {
					'Content-Type': 'multipart/form-data',
				},
				payload,
			});

			expect(response.statusCode).toBe(201);
			expect(response.headers.location).toBe(`/api/uploads/${newUpload.id}`);
			const data = response.json();
			expect(data.id).toBe(newUpload.id);
			expect(data.original_filename).toBe(newUpload.original_filename);
			expect(data.mimetype).toBe(newUpload.mimetype);
		});

		it('returns 400 when payload is missing', async () => {
			// Mock request.file() method to return null

			const response = await app.inject({
				method: 'POST',
				url: '/api/uploads',
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			expect(response.statusCode).toBe(400);
		});

		it('returns 400 when file is missing', async () => {
			// Mock request.file() method to return null

			const response = await app.inject({
				method: 'POST',
				url: '/api/uploads',
				headers: {
					'Content-Type': 'multipart/form-data',
				},
				payload: new FormData(),
			});

			expect(response.statusCode).toBe(400);
		});

		it('returns 400 when upload creation fails', async () => {
			const mockCreateUpload = uploadModule.service.createUpload as Mock;
			mockCreateUpload.mockReturnValueOnce(() => Promise.resolve(undefined));

			const payload = new FormData();
			payload.append('file', new File(['mock image content'], 'test-image.jpg', {
				type: 'image/jpeg',
			}));

			const response = await app.inject({
				method: 'POST',
				url: '/api/uploads',
				headers: {
					'Content-Type': 'multipart/form-data',
				},
				payload,
			});

			expect(response.statusCode).toBe(400);
		});
	});

	describe('get upload by ID', () => {
		it('returns a single upload', async () => {
			const mockGetUploadById = uploadModule.service.getUploadById as Mock;
			const mockUpload = {
				id: 'upload123',
				original_filename: 'test-image.jpg',
				mimetype: 'image/jpeg',
				created_at: new Date().toISOString()
			};
			mockGetUploadById.mockReturnValueOnce(() => mockUpload);

			const response = await app.inject({
				method: 'GET',
				url: `/api/uploads/${mockUpload.id}`,
				headers: {
					Accept: 'application/json',
				},
			});

			expect(response.statusCode).toBe(200);
			const data = response.json();
			expect(data.id).toBe(mockUpload.id);
			expect(data.original_filename).toBe(mockUpload.original_filename);
			expect(data.mimetype).toBe(mockUpload.mimetype);
		});

		it('returns 404 when upload not found', async () => {
			const mockGetUploadById = uploadModule.service.getUploadById as Mock;
			mockGetUploadById.mockReturnValueOnce(() => undefined);

			const response = await app.inject({
				method: 'GET',
				url: '/api/uploads/non-existent',
				headers: {
					Accept: 'application/json',
				},
			});

			expect(response.statusCode).toBe(404);
		});
	});

	describe('delete upload', () => {
		it('successfully deletes an upload', async () => {
			const mockDeleteUpload = uploadModule.service.deleteUpload as Mock;
			mockDeleteUpload.mockReturnValueOnce(() => true);

			const response = await app.inject({
				method: 'DELETE',
				url: '/api/uploads/upload123',
				headers: {
					Accept: 'application/json',
				},
			});

			expect(response.statusCode).toBe(204);
			expect(response.body).toBe('');
		});

		it('returns 404 when upload not found', async () => {
			const mockDeleteUpload = uploadModule.service.deleteUpload as Mock;
			mockDeleteUpload.mockReturnValueOnce(() => false);

			const response = await app.inject({
				method: 'DELETE',
				url: '/api/uploads/non-existent',
				headers: {
					Accept: 'application/json',
				},
			});

			expect(response.statusCode).toBe(404);
		});
	});

	describe('get upload binary', () => {
		it('returns the binary content of an upload', async () => {
			const mockGetUploadById = uploadModule.service.getUploadById as Mock;
			const mockUpload = {
				id: 'upload123',
				original_filename: 'test-image.jpg',
				mimetype: 'image/jpeg',
				created_at: new Date().toISOString()
			};
			mockGetUploadById.mockReturnValueOnce(() => mockUpload);

			const response = await app.inject({
				method: 'GET',
				url: `/api/uploads/${mockUpload.id}/binary`,
			});

			expect(response.statusCode).toBe(200);
			expect(response.headers['content-type']).toBe(mockUpload.mimetype);
			expect(response.body).toBe('mock image content');
		});

		it('returns 404 when upload not found', async () => {
			const mockGetUploadById = uploadModule.service.getUploadById as Mock;
			mockGetUploadById.mockReturnValueOnce(() => undefined);

			const response = await app.inject({
				method: 'GET',
				url: '/api/uploads/non-existent/binary',
			});

			expect(response.statusCode).toBe(404);
		});
	});
});
