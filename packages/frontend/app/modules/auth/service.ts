import type {Session, User} from '@piano-man/backend';

export const logIn = async (username: User['username'], password: string) => {
	const response = await fetch(`/api/auth/log-in`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username,
			password,
		}),
	});
	const data = await response.json();
	if (!response.ok) {
		throw data;
	}
	return data as Session;
};

export const logOut = async (sessionId: Session['id']) => {
	await fetch('/api/auth/log-out', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${sessionId}`,
		},
	});
};
