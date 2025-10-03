import {Database} from 'better-sqlite3';
import {createUser, getUserByUsername, invalidateUserSessions, updateUserPassword} from '../src/modules/auth/service';
import {createDb} from '../db';

const main = (db: Database, username?: string, password?: string) => {
	if (!username) {
		console.error('No default username provided!');
		process.exit(-1);
	}

	if (!password) {
		console.error('No default password provided!');
		process.exit(-1);
	}

	console.log('Checking if default user exists...');
	const existingUser = getUserByUsername(db)(username);
	if (!existingUser) {
		console.log(`Nope, creating default user...`);
		createUser(db)(username, password);
	} else {
		console.log(`Yep, updating default user password instead...`);
		updateUserPassword(db)(username, password);
		console.log(`Invalidating default user sessions...`);
		invalidateUserSessions(db)(existingUser.id);
	}

	console.log('Done!');
}

main(createDb(), process.env.DEFAULT_USERNAME, process.env.DEFAULT_PASSWORD);
