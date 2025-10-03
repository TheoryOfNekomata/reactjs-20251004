import type { Piano, PianoImage } from '@piano-man/backend';

interface QueryPianosParams {
	q?: string;
	c?: number;
	p?: number;
}

export const queryPianos = async (params = {} as QueryPianosParams) => {
	const searchParams = new URLSearchParams();
	if (params.q) {
		searchParams.append('q', params.q);
	}
	if (params.c) {
		searchParams.append('c', params.c.toString());
	}
	if (params.p) {
		searchParams.append('p', params.p.toString());
	}
	const response = await fetch(`/api/pianos?${searchParams.toString()}`);
	const pianoData = await response.json();
	return {
		data: pianoData,
		count: Number(response.headers.get('X-Total-Count')),
	} as {
		data: (Piano & { image?: PianoImage })[];
		count: number;
	};
};

export const getPianoById = async (id: string) => {
	const response = await fetch(`/api/pianos/${id}`);
	const data = await response.json();
	return data as Piano & { images: PianoImage[] };
};
