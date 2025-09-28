export interface Piano {
	id: string;
	model: string;
	created_at: Date;
}

export interface PianoImage {
	id: string;
	piano_id: Piano['id'];
	image_upload_id: Upload['id'];
}

export interface Upload {
	id: string;
	original_filename: string;
	mimetype: string;
	created_at: Date;
}
