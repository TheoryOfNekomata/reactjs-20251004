// Create a new piano image
import {Database} from 'better-sqlite3';
import {MultipartFile} from '@fastify/multipart';
import {randomUUID} from 'node:crypto';
import { join } from 'node:path';
import {pipeline} from 'node:stream/promises';
import {createWriteStream, existsSync, readFileSync, unlinkSync} from 'node:fs';
import {Upload} from '../../models';

export const getUploadById = (db: Database) => (id: Upload['id']) => {
	const query = readFileSync('src/modules/upload/queries/get-upload-by-id.sql', { encoding: 'utf-8' });
	const stmt = db.prepare<[Upload['id']], Upload>(query);
	return stmt.get(id);
};

const isValidImageMimetype = (mimetype: string) => {
	const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
	return validImageTypes.includes(mimetype);
};

export const createUpload = (db: Database, basePath: string) => async (file: MultipartFile) => {
	// First verify the piano exists
	// Check if file is an image
	if (!isValidImageMimetype(file.mimetype)) {
		return undefined;
	}

	// Generate a unique ID and filename
	const id = randomUUID();
	const savePath = join(basePath, id);

	try {
		// Save file to disk
		await pipeline(file.file, createWriteStream(savePath));

		// Save metadata to database
		const query = readFileSync('src/modules/upload/queries/create-upload.sql', { encoding: 'utf-8' });
		const stmt = db.prepare<[Upload['id'], Upload['original_filename'], Upload['mimetype']]>(query);
		stmt.run(
			id,
			file.filename,
			file.mimetype,
		);

		const pianoImage = getUploadById(db)(id);
		return pianoImage;
	} catch (error) {
		console.error('Error saving image:', error);
	}
};

// Delete a piano image
export const deleteUpload = (db: Database, basePath: string) => (id: Upload['id']) => {
	// Check if image exists
	const image = getUploadById(db)(id);
	if (!image) {
		return false;
	}

	try {
		// Delete file from disk
		const filePath = join(basePath, image.id);
		if (existsSync(filePath)) {
			unlinkSync(filePath);
		}

		// Delete from database
		const query = readFileSync('src/modules/upload/queries/delete-upload.sql', { encoding: 'utf-8' });
		const stmt = db.prepare<[Upload['id']]>(query);
		stmt.run(id);

		return true;
	} catch (error) {
		console.error('Error deleting image:', error);
		throw error;
	}
};
