import {Database} from 'better-sqlite3';
import {prepareQuery} from '../../sql';
import {Session, User} from '../../models';
import {randomUUID} from 'node:crypto';
import {compareSync, genSaltSync, hashSync} from 'bcrypt';

const getUserById = (db: Database) => (id: User['id']) => {
	const stmt = prepareQuery<[User['id']], User>(db, 'src/modules/auth/queries/get-user-by-id.sql');
	return stmt.get(id);
};

export const getUserByUsername = (db: Database) => (username: User['username']) => {
	const stmt = prepareQuery<[User['username']], User>(db, 'src/modules/auth/queries/get-user-by-username.sql');
	return stmt.get(username);
};

export const isPasswordMatched = (passwordPlaintext: string, passwordHashed: User['password_hashed']) => {
	return compareSync(passwordPlaintext, passwordHashed);
};

export const createUser = (db: Database) => (username: User['username'], passwordPlaintext: string) => {
	const id = randomUUID();
	const salt =  genSaltSync(12);
	const passwordHashed = hashSync(passwordPlaintext, salt);
	const stmt = prepareQuery<[User['id'], User['username'], User['password_hashed']]>(db, 'src/modules/auth/queries/create-user.sql');
	stmt.run(id, username, passwordHashed);
	return getUserById(db)(id);
};

export const updateUserPassword = (db: Database) => (username: User['username'], passwordPlaintext: string) => {
	const salt =  genSaltSync(12);
	const passwordHashed = hashSync(passwordPlaintext, salt);
	const stmt = prepareQuery<[User['password_hashed'], User['username']]>(db, 'src/modules/auth/queries/update-user-password.sql');
	stmt.run(passwordHashed, username);
	return getUserByUsername(db)(username);
};

export const getSessionById = (db: Database) => (id: Session['id']) => {
	const stmt = prepareQuery<[Session['id']], Session>(db, 'src/modules/auth/queries/get-session-by-id.sql');
	return stmt.get(id);
};

export const createSession = (db: Database) => (userId: User['id'], validForDays = 3) => {
	const id = randomUUID();
	const stmt  = prepareQuery<[Session['id'], Session['user_id'], number]>(db, 'src/modules/auth/queries/create-session.sql');
	stmt.run(id, userId, validForDays);
	return getSessionById(db)(id);
};

export const invalidateSession = (db: Database) => (sessionId: Session['id']) => {
	const stmt = prepareQuery<[Session['id']]>(db, 'src/modules/auth/queries/invalidate-session.sql');
	stmt.run(sessionId);
	return getSessionById(db)(sessionId);
};

export const invalidateUserSessions = (db: Database) => (userId: Session['user_id']) => {
	const stmt = prepareQuery<[Session['id']]>(db, 'src/modules/auth/queries/invalidate-user-sessions.sql');
	stmt.run(userId);
};
