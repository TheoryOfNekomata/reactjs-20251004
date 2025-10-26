import {hooks as authHooks} from '~/modules/auth';
import {useEffect} from 'react';
import { redirect, useNavigate } from 'react-router';

export const loader = () => {
  return redirect('/pianos');
};

export default function IndexPage() {
	const navigate = useNavigate();
	const { session } = authHooks.useSession();

	useEffect(() => {
		if (session === null) {
			navigate('/log-in');
			return;
		}
		if (typeof session !== 'undefined') {
			navigate('/pianos');
		}
	}, [session]);

	return null;
}
