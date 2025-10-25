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
  if (response.ok) {
    return {
      data: pianoData,
      count: Number(response.headers.get('X-Total-Count')),
    } as {
      data: (Piano & { image?: PianoImage })[];
      count: number;
    };
  }

  throw pianoData;
};

export const getPianoById = async (id: string) => {
	const response = await fetch(`/api/pianos/${id}`);
	const data = await response.json();
  if (response.ok) {
    return data as Piano & { images: PianoImage[] };
  }
  throw data;
};

export const createPiano = async (data: Partial<Piano> & { images: Pick<PianoImage, 'image_upload_id'>[] }) => {
  const response = await fetch('/api/pianos', {
    method: 'POST',
    body: JSON.stringify({
      model: data.model,
      description: data.description,
      images: data.images.map((u) => {
        return {
          upload_id: u.image_upload_id,
        };
      })
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
  const d = await response.json();
  if (response.ok) {
    return d as Piano;
  }

  throw data;
};

export const updatePiano = async (id: Piano['id'], data: Partial<Piano>) => {
  const response = await fetch(`/api/pianos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      model: data.model,
      description: data.description
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
  const d = await response.json();
  if (response.ok) {
    return d as Piano;
  }
  throw data;
};

export const deletePiano = async (id: string) => {
  const response = await fetch(`/api/pianos/${id}`, {
    method: 'DELETE',
  })

  return response.ok;
}

export const formatPianoCreatedAt = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString();
};

export const formatPianoCreatedAtIso = (timestamp: number) => {
  return new Date(timestamp * 1000).toISOString();
}