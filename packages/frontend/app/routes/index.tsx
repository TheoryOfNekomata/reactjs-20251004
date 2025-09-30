import type {Route} from './+types/index';
import {useQuery} from '@tanstack/react-query';
import {queryPianos} from '~/modules/piano/service';
import {Link, useSearchParams} from 'react-router';
import {type ChangeEventHandler, type FormEventHandler, useRef} from 'react';
import {SearchTextInput} from '~/components/SearchTextInput';

export function meta({}: Route.MetaArgs) {
	return [
		{title: 'Piano Man'},
		{name: 'description', content: 'Only the most unique pianos!'},
	];
}

export default function IndexPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const {data: pianoData, isLoading: isLoadingPianoData} = useQuery({
		queryKey: ['queryPianos', searchParams.get('q'), searchParams.get('c'), searchParams.get('p')],
		queryFn: () => queryPianos({
			q: searchParams.get('q') ?? undefined,
			c: Number(searchParams.get('c')) ?? undefined,
			p: Number(searchParams.get('p')) ?? undefined,
		}),
	});
	const debounceRef = useRef<number>(null);

	const processSearch = (form: HTMLElementTagNameMap['form']) => {
		const q = form.elements.namedItem('q') as HTMLElementTagNameMap['input'];
		const newSearchParams = new URLSearchParams(searchParams);
		newSearchParams.set('q', q.value);
		setSearchParams(newSearchParams);
	};

	const handleSubmit: FormEventHandler<HTMLElementTagNameMap['form']> = (e) => {
		e.preventDefault();
		processSearch(e.currentTarget);
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

			processSearch(form);
		}, 500);
	};

	return (
		<div>
			<header className="top-0 left-0 w-full h-16 sticky bg-black">
				<div className="max-w-xl mx-auto px-4 h-full flex gap-4 justify-between items-center">
					<div>
						<Link to="/">
							<span className="font-extrabold text-lg leading-0 md:text-2xl uppercase">
								Piano Man
							</span>
						</Link>
					</div>
					<div>
						<form onSubmit={handleSubmit}>
							<SearchTextInput
								placeholder="Enter search query here&hellip;"
								name="q"
								onChange={handleChange}
							/>
						</form>
					</div>
					<div>
						<Link to="/log-in">
							Log In
						</Link>
					</div>
				</div>
			</header>
			<div className="max-w-lg mx-auto px-4">
				{!isLoadingPianoData && pianoData.map((d) => (
					<article
						key={d.id}
						className="border rounded-lg overflow-hidden my-4"
					>
						<Link
							to={`/pianos/${d.id}`}
							className="block"
						>
							<div className="w-full h-32 bg-current/25">
								<img
									className="w-full h-full block object-center object-cover"
									src={d.image ? `http://localhost:5173/api/uploads/${d.image.image_upload_id}/binary` : 'http://lorempixel.com/200'}
									alt={d.model}
								/>
							</div>
							<div className="px-4 py-3">
								<div className="font-bold text-xl">
									{d.model}
								</div>
								<small>
									{new Date(d.created_at * 1000).toLocaleString()}
								</small>
							</div>
						</Link>
					</article>
				))}
			</div>
		</div>
	);
}
