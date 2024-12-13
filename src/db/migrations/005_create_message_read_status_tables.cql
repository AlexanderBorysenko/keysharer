CREATE TABLE IF NOT EXISTS app_keyspace.message_reads (
    chat_id UUID,         -- Partition Key
    user_id UUID,         -- Partition Key
    message_id TIMEUUID,  -- Clustering Key
    PRIMARY KEY ((chat_id, user_id), message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);

CREATE TABLE IF NOT EXISTS app_keyspace.user_unread_count (
    user_id UUID,          -- Partition Key
    chat_id UUID,          -- Clustering Key
    unread_count COUNTER,  -- Unread messages count
    PRIMARY KEY (user_id, chat_id)
);