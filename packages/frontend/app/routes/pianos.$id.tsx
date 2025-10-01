import {Link, useParams} from 'react-router';
import {useQuery} from '@tanstack/react-query';
import {getPianoById} from '~/modules/piano/service';
import {Header} from '~/components/Header';
import {useSearch} from '~/modules/search/hooks';

export default function PianoPage() {
	const {searchParams, processSearch} = useSearch();
	const { id: idRaw } = useParams<{ id: string }>();
	const id = idRaw as string;
	const { data: pianoData, isLoading: isLoadingPianoData } = useQuery({
		queryKey: ['getPianoById', id],
		queryFn: () => getPianoById(id),
	});
	const [firstImage] = pianoData ? pianoData.images : [];
	const currentImage = searchParams.get('image_id');
	return (
		<>
			<Header defaultSearchQuery={searchParams.get('q') ?? undefined} processSearch={processSearch} />
			<main>
				{!isLoadingPianoData && pianoData && (
					<article>
						<header className="relative min-h-28">
							<div className="absolute bottom-0 left-0 w-full bg-black/75 text-white">
								<div className="max-w-5xl mx-auto px-4 flex flex-col justify-center gap-2 h-28">
									<h1 className="text-5xl font-bold">
										{pianoData.model}
									</h1>
									<time dateTime={new Date(pianoData.created_at * 1000).toISOString()} className="font-bold">
										Added {new Date(pianoData.created_at * 1000).toLocaleString()}
									</time>
								</div>
							</div>
							<img src={`/api/uploads/${firstImage.image_upload_id}/binary`} alt={`${pianoData.model} Image #1`} className="h-96 w-full object-cover object-center" />
						</header>
						<div className="max-w-5xl mx-auto px-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-8">
								{pianoData.images.map((d, i) => (
									<article
										key={d.id}
										className="border border-current/25 rounded-lg overflow-hidden"
									>
										<Link
											to={`/pianos/${pianoData.id}?image_id=${d.image_upload_id}`}
											className="block group active:opacity-50"
										>
											<div className="w-full h-64">
												<img
													className="w-full h-full block object-center object-cover opacity-25 group-hover:opacity-100 transition-opacity"
													src={`/api/uploads/${d.image_upload_id}/binary`}
													alt={`${pianoData.model} Image #${i + 1}`}
												/>
											</div>
										</Link>
									</article>
								))}
							</div>
						</div>
					</article>
				)}
			</main>
			{
				!isLoadingPianoData && pianoData && currentImage && (
					<dialog className="fixed top-0 left-0 w-full h-full z-10" open onClick={() => window.history.back()}>
						<img className="w-full h-full object-center object-contain" src={`/api/uploads/${currentImage}/binary`} alt={pianoData.model} />
					</dialog>
				)
			}
		</>
	);
}
