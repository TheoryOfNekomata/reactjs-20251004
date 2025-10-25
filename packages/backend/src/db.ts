import {config} from 'dotenv';
import SqliteDatabase, {Database} from 'better-sqlite3';

config({ quiet: true });

export const createDb = (): Database => new SqliteDatabase(process.env.DATABASE_FILENAME ?? ':memory:');
