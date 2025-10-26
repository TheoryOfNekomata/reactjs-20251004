import {Link, useNavigate} from 'react-router';
import {SearchTextInput} from '~/components/SearchTextInput';
import {
  type ChangeEventHandler,
  type FC,
  type FormEventHandler,
  type MouseEventHandler, useEffect,
  useRef,
  useState,
} from 'react';
import {useSession} from '~/modules/auth/hooks';

export interface HeaderProps {
	processSearch?: (form: HTMLElementTagNameMap['form']) => (void | Promise<void>);
	defaultSearchQuery?: string;
	searchDebounceTimer?: number;
  hasSearch?: boolean;
}

export const Header: FC<HeaderProps> = ({
	processSearch,
	defaultSearchQuery = '',
	searchDebounceTimer = 500,
  hasSearch = false,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
	const navigate = useNavigate();
	const { username, destroySession } = useSession();
	const debounceRef = useRef<number>(null);
  const userMenuClickedRef = useRef(false);

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

  const toggleUserMenu: MouseEventHandler<HTMLElementTagNameMap['div']> = () => {
    userMenuClickedRef.current = true;
    setUserMenuOpen(true);
  };

  useEffect(() => {
    const toggleUserMenu = () => {
      if (userMenuClickedRef.current) {
        userMenuClickedRef.current = false;
        return;
      }
      setUserMenuOpen(false);
    };

    window.addEventListener('click', toggleUserMenu);
    return () => {
      window.removeEventListener('click', toggleUserMenu);
    };
  }, []);

	return (
		<header className="z-10 top-0 left-0 w-full h-16 sticky bg-black border-b border-b-current/25 text-white">
			<div className="max-w-5xl mx-auto px-4 h-full flex gap-4 justify-between items-center">
				<div>
					<Link to="/">
						<span className="font-extrabold text-lg leading-0 md:text-2xl uppercase">
							Piano Man
						</span>
					</Link>
				</div>
        {
          hasSearch
          && (
            <div>
              <form onSubmit={handleSubmit}>
                <SearchTextInput
                  placeholder="Enter search query here&hellip;"
                  name="q"
                  defaultValue={defaultSearchQuery}
                  onChange={handleChange}
                  autoFocus
                />
              </form>
            </div>
          )
        }
				<div className="h-full flex shrink-0">
					{username === null && (
            <div className="relative h-full flex items-center">
              <Link to="/log-in" className="h-12 px-4 flex items-center justify-start">
                Log In
              </Link>
            </div>
					)}
					{username && (
            <div className="relative h-full flex items-center" onClickCapture={toggleUserMenu}>
              <button type="button" className="cursor-pointer text-xs flex gap-2 font-bold items-center">
                <img src="https://avatars.githubusercontent.com/u/2346301?v=4" alt={username} className="w-12 h-12 rounded-full overflow-hidden object-center object-cover" />
                {' '}
                <span className="sr-only md:not-sr-only">
                  {username}
                </span>
              </button>
              {userMenuOpen && (
                <div className="absolute top-full min-w-48 mt-2 right-0 bg-black rounded border">
                  <Link to="/my/settings" className="h-12 px-4 flex items-center justify-start">
                    Settings
                  </Link>
                  <form onSubmit={handleLogout}>
                    <button type="submit" className="cursor-pointer h-12 px-4 w-full flex items-center justify-start">
                      Log out
                    </button>
                  </form>
                </div>
              )}
            </div>
					)}
				</div>
			</div>
		</header>
	);
};
