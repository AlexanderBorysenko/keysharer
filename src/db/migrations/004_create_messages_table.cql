CREATE TABLE IF NOT EXISTS app_keyspace.messages (
    id TIMEUUID,
    chat_id UUID,
    user_id UUID,
    type TEXT,
    content TEXT,
    status TEXT,
    timestamp TIMESTAMP,
    PRIMARY KEY (chat_id, id)
) WITH CLUSTERING ORDER BY (id ASC);

CREATE INDEX ON app_keyspace.messages (id);
CREATE INDEX ON app_keyspace.messages (status);
CREATE INDEX ON app_keyspace.messages (user_id);