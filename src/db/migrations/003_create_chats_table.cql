CREATE TABLE IF NOT EXISTS app_keyspace.chats (
    id UUID PRIMARY KEY,
    name text,
    avatar text,
    owner_id UUID,
);
CREATE INDEX IF NOT EXISTS ON app_keyspace.chats (owner_id);

CREATE TABLE IF NOT EXISTS app_keyspace.user_chat (
    chat_id UUID,
    user_id UUID,
    PRIMARY KEY (chat_id, user_id)
);
CREATE INDEX IF NOT EXISTS ON app_keyspace.user_chat (user_id);

