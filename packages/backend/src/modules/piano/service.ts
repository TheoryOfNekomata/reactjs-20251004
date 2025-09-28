import { readFileSync } from 'node:fs';
import {Database} from 'better-sqlite3';
import {randomUUID} from 'node:crypto';
import { Piano, PianoImage } from '../../models';
import {getUploadById} from '../upload/service';

export const getPianoById = (db: Database) => (id: Piano['id']) => {
	const getByIdQuery = readFileSync('src/modules/piano/queries/get-piano-by-id.sql', { encoding: 'utf-8' });
	const queryStmt = db.prepare<[Piano['id']], Piano>(getByIdQuery);
	return queryStmt.get(id);
};

export interface CreatePiano extends Omit<Piano, 'id' | 'created_at'> {}

export const createNewPiano = (db: Database) => (pianoData: CreatePiano): Piano | undefined => {
	const createQuery = readFileSync('src/modules/piano/queries/create-new-piano.sql', { encoding: 'utf-8' });
	const id = randomUUID();
	const createStmt = db.prepare<[Piano['id'], Piano['model']]>(createQuery);
	createStmt.run(id, pianoData.model);

	return getPianoById(db)(id);
};

export const deletePiano = (db: Database) => (id: Piano['id']) => {
	const existingPiano = getPianoById(db)(id);
	if (!existingPiano) {
		return false;
	}
	const queries = readFileSync('src/modules/piano/queries/delete-piano-by-id.sql', { encoding: 'utf-8' }).split(';');
	const [deleteImagesQuery, deleteQuery] = queries.map(q => q + ';');
	const deleteImagesStmt = db.prepare<[Piano['id']]>(deleteImagesQuery);
	deleteImagesStmt.run(id);
	const deleteStmt = db.prepare<[Piano['id']]>(deleteQuery);
	deleteStmt.run(id);
	return true;
};

export interface UpdatePianoModelPiano extends Omit<Piano, 'id' | 'created_at'> {}

export const updatePianoModel = (db: Database) => (id: Piano['id']) => (pianoData: UpdatePianoModelPiano) => {
	const updateQuery = readFileSync('src/modules/piano/queries/update-piano-model.sql', { encoding: 'utf-8' });
	const updateStmt = db.prepare<[Piano['model'], Piano['id']]>(updateQuery);
	updateStmt.run(pianoData.model, id);

	return getPianoById(db)(id);
};

export interface PianoQuery {
	query?: string;
	page?: number;
	itemsPerPage?: number;
}

export const queryPianos = (db: Database) => (pianoQuery: PianoQuery) => {
	const query = `%${pianoQuery.query ?? ''}%`;
	const page = typeof pianoQuery.page === 'number' && Number.isFinite(pianoQuery.page) ? pianoQuery.page : 1;
	const itemsPerPage = typeof pianoQuery.itemsPerPage === 'number' && Number.isFinite(pianoQuery.itemsPerPage) ? pianoQuery.itemsPerPage : 10;
	const offset = (page - 1) * itemsPerPage;

	const countQuery = readFileSync('src/modules/piano/queries/query-piano-count.sql', { encoding: 'utf-8' });
	const countStmt = db.prepare<[typeof query, typeof itemsPerPage, typeof offset], { count: number }>(countQuery);
	const { count = 0 } = countStmt.get(query, itemsPerPage, offset) ?? {};

	const queryQuery = readFileSync('src/modules/piano/queries/query-piano.sql', { encoding: 'utf-8' });
	const queryStmt = db.prepare<[typeof query, typeof itemsPerPage, typeof offset], Piano>(queryQuery);
	return {
		data: queryStmt.all(query, itemsPerPage, offset),
		count,
	};
};

// Get piano image by ID
const getPianoImageById = (db: Database) => (id: PianoImage['id']) => {
	const query = readFileSync('src/modules/piano/queries/get-piano-image-by-id.sql', { encoding: 'utf-8' });
	const stmt = db.prepare<[PianoImage['id']], PianoImage>(query);
	return stmt.get(id);
};

// Get all images for a piano
export const getPianoImages = (db: Database) => (pianoId: Piano['id']) => {
	const query = readFileSync('src/modules/piano/queries/get-piano-images.sql', { encoding: 'utf-8' });
	const stmt = db.prepare<[Piano['id']], PianoImage & { piano_image_id: PianoImage['id'] }>(query);
	return stmt.all(pianoId).map(({ id: _, piano_image_id, ...etcPianoImage }) => ({
		...etcPianoImage,
		id: piano_image_id,
	}));
};

// Create a new piano image
export const createPianoImage = (db: Database) => (pianoId: PianoImage['piano_id'], uploadId: PianoImage['image_upload_id']) => {
	// First verify the piano exists
	const piano = getPianoById(db)(pianoId);
	if (!piano) {
		return undefined;
	}

	const upload = getUploadById(db)(uploadId);
	if (!upload) {
		return undefined;
	}

	// Generate a unique ID and filename
	const id = randomUUID();
	const query = readFileSync('src/modules/piano/queries/create-piano-image.sql', { encoding: 'utf-8' });
	const stmt = db.prepare<[PianoImage['id'], PianoImage['piano_id'], PianoImage['image_upload_id']]>(query);
	stmt.run(
		id,
		pianoId,
		uploadId,
	);

	const pianoImage = getPianoImageById(db)(id);
	return pianoImage;
};

// Delete a piano image
export const deletePianoImage = (db: Database) => (imageId: PianoImage['id']) => {
	// Check if image exists
	const image = getPianoImageById(db)(imageId);
	if (!image) {
		return false;
	}

	try {

		// Delete from database
		const query = readFileSync('src/modules/piano/queries/delete-piano-image-by-id.sql', { encoding: 'utf-8' });
		const stmt = db.prepare<[PianoImage['id']]>(query);
		stmt.run(imageId);

		return true;
	} catch (error) {
		console.error('Error deleting image:', error);
		throw error;
	}
};
