import {hooks as searchHooks} from '~/modules/search';
import {Header} from '~/components/Header';
import {TextInput} from '~/components/TextInput';
import {MaskedTextInput} from '~/components/MaskedTextInput';
import {Button} from '~/components/Button';
import {type FormEventHandler, useEffect, useState} from 'react';
import {useMutation} from '@tanstack/react-query';
import type { Session } from '@piano-man/backend';
import {useNavigate} from 'react-router';
import {service as authService, hooks as authHooks} from '~/modules/auth';

export default function LogInPage() {
	const navigate = useNavigate();
	const { session, persistSession } = authHooks.useSession();
	const [error, setError] = useState<Error>();
	const {searchParams, processSearch} = searchHooks.useSearch();
	const { mutate: doLogin } = useMutation<Session, Error, { username: string, password: string }>({
		mutationKey: ['logIn'],
		mutationFn: async (variables) => authService.logIn(variables.username, variables.password),
		onError: (error) => {
			setError(error);
		},
		onSuccess: (data, variables) => {
			persistSession(data, variables.username);
			navigate('/');
		},
	});

	const handleLogIn: FormEventHandler<HTMLElementTagNameMap['form']> = (e) => {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		setError(undefined);
		doLogin({
			username: data.get('username') as string,
			password: data.get('password') as string,
		});
	};

	useEffect(() => {
		if (typeof session !== 'undefined' && session !== null) {
			navigate('/');
			return;
		}
	}, [session]);

	if (session !== null) {
		return null;
	}

	return (
		<>
			<Header defaultSearchQuery={searchParams.get('q') ?? undefined} processSearch={processSearch} />
			<main className="max-w-sm mx-auto px-4">
				<div className="my-8">
					{error && (
						<div className="mb-7 rounded border-red-400 text-red-600 dark:text-red-200 dark:border-red-400 border px-4 py-2">
							Could not log in.
						</div>
					)}
					<form onSubmit={handleLogIn}>
						<div className="flex gap-4 flex-col">
							<div>
								<TextInput name="username" placeholder="Username" />
							</div>
							<div>
								<MaskedTextInput name="password" placeholder="Password" />
							</div>
							<div>
								<Button type="submit" variant="primary">
									Log In
								</Button>
							</div>
						</div>
					</form>
				</div>
			</main>
		</>
	);
}
