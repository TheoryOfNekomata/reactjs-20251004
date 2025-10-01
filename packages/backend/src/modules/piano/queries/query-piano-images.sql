SELECT piano_images.*, uploads.*
FROM pianos
			 LEFT JOIN piano_images on pianos.id = piano_images.piano_id
			 JOIN (SELECT * FROM uploads ORDER BY created_at DESC) AS uploads on uploads.id = piano_images.image_upload_id
WHERE model LIKE ?;
