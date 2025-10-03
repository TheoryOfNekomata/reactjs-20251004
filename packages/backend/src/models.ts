export interface Piano {
	id: string;
	model: string;
	description: string;
	created_at: number; // Date
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
	created_at: number; // Date
}

export interface User {
	id: string;
	username: string;
	password_hashed: string;
}

export interface Session {
	id: string;
	user_id: User['id'];
	valid_until: number; // Date;
}

export interface Comment {
	id: string;
	user_id: User['id'];
	piano_id: Piano['id'];
	content: string;
	created_at: number; // Date
	updated_at: number; // Date
}
