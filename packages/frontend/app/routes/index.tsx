import type {Route} from './+types/index';
import {useQuery} from '@tanstack/react-query';
import {queryPianos} from '~/modules/piano/service';
import {Link} from 'react-router';
import {Header} from '~/components/Header';
import {usePagination, useSearch} from '~/modules/search/hooks';
import type {FormEventHandler} from 'react';
import {Button} from '~/components/Button';

export function meta({}: Route.MetaArgs) {
	return [
		{title: 'Piano Man'},
		{name: 'description', content: 'Only the most unique pianos!'},
	];
}

export default function IndexPage() {
	const {searchParams, processSearch} = useSearch();
	const {goToNextPage, goToPreviousPage} = usePagination();
	const {data: pianoData, isLoading: isLoadingPianoData} = useQuery({
		queryKey: ['queryPianos', searchParams.get('q'), searchParams.get('c'), searchParams.get('p')],
		queryFn: () => queryPianos({
			q: searchParams.get('q') ?? undefined,
			c: Number(searchParams.get('c')) ?? undefined,
			p: Number(searchParams.get('p')) ?? undefined,
		}),
	});

	const paginate: FormEventHandler<HTMLElementTagNameMap['form']> = (e) => {
		e.preventDefault();
		const { submitter } = e.nativeEvent as unknown as { submitter: HTMLElementTagNameMap['button'] };
		if (submitter.name !== 'action') {
			return;
		}
		switch (submitter.value) {
			case 'previous':
				goToPreviousPage(e.currentTarget);
				return;
			case 'next':
				goToNextPage(e.currentTarget);
				return;
			default:
				break;
		}
	};

	return (
		<>
			<Header defaultSearchQuery={searchParams.get('q') ?? undefined} processSearch={processSearch} />
			<main className="max-w-2xl lg:max-w-5xl mx-auto px-4">
				{!isLoadingPianoData && (
					<>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-8">
							{pianoData?.data.map((d) => (
								<article
									key={d.id}
									className="border border-current/15 dark:border-current/25 rounded-lg overflow-hidden shadow-sm dark:shadow-none"
								>
									<Link
										to={`/pianos/${d.id}`}
										className="block group active:opacity-50"
									>
										<div className="w-full h-32">
											<img
												className="w-full h-full block object-center object-cover opacity-25 group-hover:opacity-100 transition-opacity"
												src={d.image ? `/api/uploads/${d.image.image_upload_id}/binary` : 'http://lorempixel.com/200'}
												alt={d.model}
											/>
										</div>
										<div className="px-4 py-3 bg-current/5 dark:bg-current/10">
											<div className="font-bold text-xl line-clamp-1" title={d.model}>
												{d.model}
											</div>
											<time className="text-xs" dateTime={new Date(d.created_at * 1000).toISOString()}>
												{new Date(d.created_at * 1000).toLocaleString()}
											</time>
										</div>
									</Link>
								</article>
							))}
						</div>
						<div className="my-8">
							<form onSubmit={paginate}>
								<input type="hidden" name="p" value={searchParams.get('p') ?? '1'} />
								<input type="hidden" name="c" value={searchParams.get('c') ?? '10'} />
								<input type="hidden" name="q" value={searchParams.get('q') ?? ''} />
								<div className="flex gap-4 justify-center">
									<div className="w-32">
										<Button type="submit" name="action" value="previous" disabled={Number(searchParams.get('p') ?? '1') <= 1}>
											Previous
										</Button>
									</div>
									<div className="w-16 h-12 flex justify-center items-center font-bold text-xl">
										{searchParams.get('p') ?? '1'}
									</div>
									<div className="w-32">
										<Button type="submit" name="action" value="next" disabled={typeof pianoData === 'undefined' || Number(searchParams.get('p') ?? '1') > Math.floor(pianoData.count / Number(searchParams.get('c') ?? '10'))}>
											Next
										</Button>
									</div>
								</div>
							</form>
						</div>
					</>
				)}
			</main>
		</>
	);
}
