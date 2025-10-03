import {useEffect, useState} from 'react';
import type {Session, User} from '@piano-man/backend';
import {useMutation} from '@tanstack/react-query';
import {logOut} from '~/modules/auth/service';

export const useSession = () => {
	const [session, setSession] = useState<Session | null>();
	const [username, setUsername] = useState<User['username'] | null>();
	const { mutate: doLogOut } = useMutation<void, Error, Session['id']>({
		mutationKey: ['logOut', session?.id],
		mutationFn: async variables => {
			await logOut(variables);
		},
	});

	const persistSession = (data: Session, username: User['username']) => {
		window.sessionStorage.setItem('piano-man-session-id', data.id);
		window.sessionStorage.setItem('piano-man-session-user-id', data.user_id);
		window.sessionStorage.setItem('piano-man-session-valid-until', data.valid_until.toString());
		window.sessionStorage.setItem('piano-man-username', username);
	};

	const destroySession = () => {
		const id = window.sessionStorage.getItem('piano-man-session-id');
		if (id) {
			doLogOut(id);
		}
		window.sessionStorage.removeItem('piano-man-session-id');
		window.sessionStorage.removeItem('piano-man-session-user-id');
		window.sessionStorage.removeItem('piano-man-session-valid-until');
		window.sessionStorage.removeItem('piano-man-username');
	};

	useEffect(() => {
		const id = window.sessionStorage.getItem('piano-man-session-id');
		const userId = window.sessionStorage.getItem('piano-man-session-user-id');
		const validUntil = Number(window.sessionStorage.getItem('piano-man-session-valid-until'));
		const username = window.sessionStorage.getItem('piano-man-username');
		if (id && userId && Number.isFinite(validUntil) && username) {
			setSession({
				id,
				user_id: userId,
				valid_until: validUntil
			});
			setUsername(username);
			return;
		}

		setSession(null);
		setUsername(null);
	}, []);

	return {
		session,
		username,
		persistSession,
		destroySession,
	};
};
