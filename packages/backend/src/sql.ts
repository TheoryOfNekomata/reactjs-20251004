import {readFileSync} from 'node:fs';
import {Database} from 'better-sqlite3';

export const prepareQuery = <Args extends unknown[], Result = unknown>(db: Database, path: string) => {
	const getByIdQuery = readFileSync(path, { encoding: 'utf-8' });
	return db.prepare<Args, Result>(getByIdQuery);
}

export const runQuery = (db: Database, path: string) => {
	const schema = readFileSync(path, { encoding: 'utf-8' });
	db.exec(schema);
};
