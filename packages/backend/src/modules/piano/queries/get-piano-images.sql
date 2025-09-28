SELECT *, piano_images.id as piano_image_id FROM piano_images JOIN uploads ON piano_images.image_upload_id = uploads.id WHERE piano_id = ? ORDER BY created_at DESC;
