import { Link, useNavigate, useParams } from 'react-router';
import {useQuery} from '@tanstack/react-query';
import {hooks as authHooks} from '~/modules/auth';
import {service as pianoService} from '~/modules/piano';
import {hooks as searchHooks} from '~/modules/search';
import {Header} from '~/components/Header';
import ReactMarkdown from 'react-markdown';
import { Button } from '~/components/Button';
import type { FormEventHandler } from 'react';

export default function PianosIdPage() {
  const { session } = authHooks.useSession();
  const navigate = useNavigate();
	const {searchParams} = searchHooks.useSearch();
	const { id: idRaw } = useParams<{ id: string }>();
	const id = idRaw as string;
	const { data: pianoData, isLoading: isLoadingPianoData } = useQuery({
		queryKey: ['getPianoById', id],
		queryFn: () => pianoService.getPianoById(id),
	});
	const [firstImage] = pianoData ? pianoData.images : [];
	const currentImage = searchParams.get('image_id');

  const doAction: FormEventHandler<HTMLElementTagNameMap['form']> = async (e) => {
    e.preventDefault();
    const { submitter } = e.nativeEvent as unknown as { submitter: HTMLElementTagNameMap['button'] };
    if (submitter.name !== 'action') {
      return;
    }

    switch (submitter.value) {
      case 'edit':
        await navigate(`/edit/pianos/${id}`);
        return;
      case 'delete':
        {
          const response = await fetch(`/api/pianos/${id}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            await navigate('/')
          }
          return;
        }
      default:
        break;
    }
  };

	return (
		<>
			<Header />
			<main>
				{!isLoadingPianoData && pianoData && (
					<article>
						<header className={`relative min-h-28 ${session ? 'pt-20' : ''}`.trim()}>
							<div className="absolute bottom-0 left-0 w-full bg-black/75 text-white">
								<div className="max-w-5xl mx-auto px-4 flex flex-col justify-center gap-2 h-28">
									<h1 className="text-2xl flex items-end lg:text-5xl font-bold line-clamp-2 h-[3em]">
										{pianoData.model}
									</h1>
									<time dateTime={pianoService.formatPianoCreatedAtIso(pianoData.created_at)} className="font-bold">
										Added {pianoService.formatPianoCreatedAt(pianoData.created_at)}
									</time>
								</div>
							</div>
							<img src={`/api/uploads/${firstImage.image_upload_id}/binary`} alt={`${pianoData.model} Image #1`} className="h-96 w-full object-cover object-center" />
              {session && (
                <div className="absolute top-0 right-0 w-full bg-black/25 text-white">
                  <div className="max-w-5xl mx-auto px-4 flex flex-col justify-center gap-2 h-20">
                    <div className="text-right">
                      <form className="inline-block align-top" onSubmit={doAction}>
                        <div className="flex flex-col md:flex-row gap-4">
                          <div>
                            <Button type="submit" name="action" value="edit">
                              Edit
                            </Button>
                          </div>
                          <div>
                            <Button type="submit" name="action" value="delete">
                              Delete
                            </Button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
						</header>
						<div className="max-w-5xl mx-auto px-4">
							<div className="my-8">
								<ReactMarkdown>
									{pianoData.description}
								</ReactMarkdown>
							</div>
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
