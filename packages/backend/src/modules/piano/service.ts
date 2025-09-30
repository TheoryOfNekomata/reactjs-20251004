import {randomUUID} from 'node:crypto';
import {Database} from 'better-sqlite3';
import { Piano, PianoImage } from '../../models';
import {prepareQuery} from '../../sql';
import {service as uploadService} from '../upload';

export const getPianoById = (db: Database) => (id: Piano['id']) => {
	const queryStmt = prepareQuery<[Piano['id']], Piano>(db, 'src/modules/piano/queries/get-piano-by-id.sql');
	return queryStmt.get(id);
};

export interface CreatePiano extends Omit<Piano, 'id' | 'created_at'> {}

export const createNewPiano = (db: Database) => (pianoData: CreatePiano): Piano | undefined => {
	const id = randomUUID();
	const createStmt = prepareQuery<[Piano['id'], Piano['model']]>(db, 'src/modules/piano/queries/create-new-piano.sql');
	createStmt.run(id, pianoData.model);
	return getPianoById(db)(id);
};

export const deletePiano = (db: Database) => (id: Piano['id']) => {
	const existingPiano = getPianoById(db)(id);
	if (!existingPiano) {
		return false;
	}

	const deleteImagesStmt = prepareQuery<[Piano['id']]>(db, 'src/modules/piano/queries/delete-piano-images-by-piano-id.sql');
	deleteImagesStmt.run(id);
	const deleteStmt = prepareQuery<[Piano['id']]>(db, 'src/modules/piano/queries/delete-piano-by-id.sql');
	deleteStmt.run(id);
	return true;
};

export interface UpdatePianoModelPiano extends Omit<Piano, 'id' | 'created_at'> {}

export const updatePianoModel = (db: Database) => (id: Piano['id']) => (pianoData: UpdatePianoModelPiano) => {
	const updateStmt = prepareQuery<[Piano['model'], Piano['id']]>(db, 'src/modules/piano/queries/update-piano-model.sql');
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

	const countStmt = prepareQuery<[typeof query, typeof itemsPerPage, typeof offset], { count: number }>(db, 'src/modules/piano/queries/query-piano-count.sql');
	const { count = 0 } = countStmt.get(query, itemsPerPage, offset) ?? {};

	const queryStmt = prepareQuery<[typeof query, typeof itemsPerPage, typeof offset], Piano>(db, 'src/modules/piano/queries/query-piano.sql');
	return {
		data: queryStmt.all(query, itemsPerPage, offset),
		count,
	};
};

// Get piano image by ID
const getPianoImageById = (db: Database) => (id: PianoImage['id']) => {
	const stmt = prepareQuery<[PianoImage['id']], PianoImage>(db, 'src/modules/piano/queries/get-piano-image-by-id.sql');
	return stmt.get(id);
};

// Get all images for a piano
export const getPianoImages = (db: Database) => (pianoId: Piano['id']) => {
	const stmt = prepareQuery<[Piano['id']], PianoImage & { piano_image_id: PianoImage['id'] }>(db, 'src/modules/piano/queries/get-piano-images.sql');
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

	const upload = uploadService.getUploadById(db)(uploadId);
	if (!upload) {
		return undefined;
	}

	// Generate a unique ID and filename
	const id = randomUUID();
	const stmt = prepareQuery<[PianoImage['id'], PianoImage['piano_id'], PianoImage['image_upload_id']]>(db, 'src/modules/piano/queries/create-piano-image.sql');
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
		const stmt = prepareQuery<[PianoImage['id']]>(db, 'src/modules/piano/queries/delete-piano-image-by-id.sql');
		stmt.run(imageId);

		return true;
	} catch (error) {
		console.error('Error deleting image:', error);
		throw error;
	}
};
