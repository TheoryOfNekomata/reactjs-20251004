CREATE TABLE IF NOT EXISTS pianos (
	id TEXT NOT NULL PRIMARY KEY,
  model TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS piano_images (
  id TEXT NOT NULL PRIMARY KEY,
  piano_id TEXT NOT NULL,
	image_upload_id TEXT NOT NULL,
  FOREIGN KEY (piano_id) REFERENCES pianos(id) ON DELETE CASCADE,
	FOREIGN KEY (image_upload_id) REFERENCES uploads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS uploads (
	id TEXT NOT NULL PRIMARY KEY,
	original_filename TEXT NOT NULL,
	mimetype TEXT NOT NULL,
	created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
