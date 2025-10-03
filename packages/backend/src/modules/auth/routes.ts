import {FastifyInstance} from 'fastify';
import * as service from './service';
import {User} from '../../models';

export const addToApp = (fastify: FastifyInstance) => {
	return fastify
		.route<{
			Body: {
				username: User['username'];
				password: string;
				valid_for_days?: number;
			}
		}>({
			method: 'POST',
			url: '/api/auth/log-in',
			handler: (request, reply) => {
				const user = service.getUserByUsername(request.server.db)(request.body.username);
				if (!user) {
					reply.status(401).send();
					return;
				}

				if (!service.isPasswordMatched(request.body.password, user.password_hashed)) {
					reply.status(401).send();
					return;
				}

				service.invalidateUserSessions(request.server.db)(user.id);
				const session = service.createSession(request.server.db)(user.id, request.body.valid_for_days);
				if (!session) {
					reply.status(500).send();
					return;
				}
				reply.send(session);
			},
		})
		.route<{
			Headers: {
				authorization: `Bearer ${string}`
			}
		}>({
			method: 'POST',
			url: '/api/auth/log-out',
			handler: (request, reply) => {
				const { authorization } = request.headers;
				if (!authorization) {
					reply.status(401).send();
					return;
				}

				const [authType, maybeSessionId] = authorization.split(' ');
				if (authType !== 'Bearer') {
					reply.status(403).send();
					return;
				}

				service.invalidateSession(request.server.db)(maybeSessionId);
				reply.status(204).send();
			},
		});
};
