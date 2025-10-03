INSERT INTO sessions (id, user_id, valid_until) VALUES (?, ?, strftime('%s', DATE('now', CONCAT('+', ?, ' day'))));
