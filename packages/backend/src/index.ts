import { app } from './app';

app({
	databaseFilename: process.env.NODE_ENV !== 'test' ? 'pianos.sqlite' : ':memory:',
}).listen({
	port: 3000,
	host: '0.0.0.0',
});
