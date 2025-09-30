SELECT DISTINCT piano_images.*, uploads.*
FROM piano_images
			 JOIN pianos ON piano_images.piano_id = pianos.id
			 JOIN (SELECT * FROM uploads ORDER BY created_at DESC) AS uploads ON piano_images.image_upload_id = uploads.id
WHERE model LIKE ?
GROUP BY piano_id
LIMIT ? OFFSET ?;
