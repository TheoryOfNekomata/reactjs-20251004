CREATE TABLE IF NOT EXISTS pianos
(
    id          TEXT    NOT NULL PRIMARY KEY,
    model       TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    created_at  INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS piano_images
(
    id              TEXT NOT NULL PRIMARY KEY,
    piano_id        TEXT NOT NULL,
    image_upload_id TEXT NOT NULL,
    FOREIGN KEY (piano_id) REFERENCES pianos (id) ON DELETE CASCADE,
    FOREIGN KEY (image_upload_id) REFERENCES uploads (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS uploads
(
    id                TEXT    NOT NULL PRIMARY KEY,
    original_filename TEXT    NOT NULL,
    mimetype          TEXT    NOT NULL,
    created_at        INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS users
(
    id              TEXT NOT NULL PRIMARY KEY,
    username        TEXT NOT NULL UNIQUE,
    password_hashed TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions
(
    id          TEXT    NOT NULL PRIMARY KEY,
    user_id     TEXT    NOT NULL,
    valid_until INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments
(
    id         TEXT    NOT NULL PRIMARY KEY,
    user_id    TEXT    NOT NULL,
    piano_id   TEXT    NOT NULL,
    content    TEXT    NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (piano_id) REFERENCES pianos (id) ON DELETE CASCADE
);
