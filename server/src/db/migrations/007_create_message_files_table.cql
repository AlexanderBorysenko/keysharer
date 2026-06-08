CREATE TABLE IF NOT EXISTS app_keyspace.message_files (
    id UUID,
    message_id UUID,
    chat_id UUID,
    file_name TEXT,
    original_file_name TEXT,
    file_size INT,
    file_type TEXT,
    upload_timestamp TIMESTAMP,
    PRIMARY KEY (message_id, id)
);