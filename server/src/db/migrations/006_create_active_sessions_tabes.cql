CREATE TABLE IF NOT EXISTS app_keyspace.user_active_sessions_count (
    user_id UUID PRIMARY KEY,
    active_sessions_count COUNTER
);