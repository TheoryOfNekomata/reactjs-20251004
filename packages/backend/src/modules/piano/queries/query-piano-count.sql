SELECT COUNT(*) AS count FROM pianos WHERE model LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?;

