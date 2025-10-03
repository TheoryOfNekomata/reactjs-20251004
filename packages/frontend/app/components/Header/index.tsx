import {Link, useNavigate} from 'react-router';
import {SearchTextInput} from '~/components/SearchTextInput';
import {type ChangeEventHandler, type FC, type FormEventHandler, useRef} from 'react';
import {useSession} from '~/modules/auth/hooks';

export interface HeaderProps {
	processSearch?: (form: HTMLElementTagNameMap['form']) => (void | Promise<void>);
	defaultSearchQuery?: string;
	searchDebounceTimer?: number;
}

export const Header: FC<HeaderProps> = ({
	processSearch,
	defaultSearchQuery = '',
	searchDebounceTimer = 500,
}) => {
	const navigate = useNavigate();
	const { username, destroySession } = useSession();
	const debounceRef = useRef<number>(null);

	const handleSubmit: FormEventHandler<HTMLElementTagNameMap['form']> = (e) => {
		e.preventDefault();
		processSearch?.(e.currentTarget);
	};

	const handleChange: ChangeEventHandler<HTMLElementTagNameMap['input']> = (e) => {
		const {form} = e.currentTarget;
		if (debounceRef.current !== null) {
			window.clearTimeout(debounceRef.current);
		}

		debounceRef.current = window.setTimeout(() => {
			if (!form) {
				return;
			}

			processSearch?.(form);
		}, searchDebounceTimer);
	};

	const handleLogout: FormEventHandler<HTMLElementTagNameMap['form']> = (e) => {
		e.preventDefault();
		destroySession();
		navigate('/');
	};

	return (
		<header className="z-10 top-0 left-0 w-full h-16 sticky bg-black border-b border-b-current/25 text-white">
			<div className="max-w-xl mx-auto px-4 h-full flex gap-4 justify-between items-center">
				<div>
					<Link to="/">
						<span className="font-extrabold text-lg leading-0 md:text-2xl uppercase">
							Piano Man
						</span>
					</Link>
				</div>
				<div>
					{username && (
						<form onSubmit={handleSubmit}>
							<SearchTextInput
								placeholder="Enter search query here&hellip;"
								name="q"
								defaultValue={defaultSearchQuery}
								onChange={handleChange}
							/>
						</form>
					)}
				</div>
				<div>
					{username === null && (
						<Link to="/log-in">
							Log In
						</Link>
					)}
					{username && (
						<form onSubmit={handleLogout}>
							<button type="submit" className="cursor-pointer">
								Log out {username}
							</button>
						</form>
					)}
				</div>
			</div>
		</header>
	);
};
