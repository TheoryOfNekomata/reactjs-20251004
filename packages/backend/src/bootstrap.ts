import { config } from 'dotenv';
import SqliteDatabase from 'better-sqlite3';
import * as pianoModule from './modules/piano';
import * as uploadModule from './modules/upload';
import { createApp } from './app';
import {runQuery} from './sql';

config({ quiet: true });

const db = new SqliteDatabase(process.env.DATABASE_FILENAME ?? ':memory:');
const app = createApp({
	database: db,
	uploadsDir: process.env.UPLOADS_DIR,
	corsAllowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(','),
	maxUploadFileSize: Number(process.env.MAX_UPLOAD_FILE_SIZE_BYTES ?? 5242880),
});

runQuery(db, 'src/schema.sql');

pianoModule.routes.addToApp(app);
uploadModule.routes.addToApp(app);

app.listen({
	port: Number(process.env.PORT ?? 3000),
	host: process.env.HOSTNAME ?? '0.0.0.0',
}).then((address) => {
	console.log(`Server running at ${address}`);
});
