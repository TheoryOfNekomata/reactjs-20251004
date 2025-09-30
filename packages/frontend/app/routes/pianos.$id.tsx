import {useParams} from 'react-router';
import {useQuery} from '@tanstack/react-query';
import {getPianoById} from '~/modules/piano/service';

export default function PianoPage() {
	const { id } = useParams<{ id: string }>();
	const { data: pianoData, isLoading: isLoadingPianoData } = useQuery({
		queryKey: ['getPianoById', id],
		queryFn: () => getPianoById(id),
	});
	return (
		<div className="max-w-sm mx-auto px-4">
			{!isLoadingPianoData && (
				<div>
					<div className="flex flex-col-reverse">
						<h1 className="text-5xl">
							{pianoData.model}
						</h1>
						{pianoData.images?.map((im, i) => (
							<img key={im.id} src={`/api/uploads/${im.image_upload_id}/binary`} alt={`${pianoData.model} Image #${i + 1}`} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}
