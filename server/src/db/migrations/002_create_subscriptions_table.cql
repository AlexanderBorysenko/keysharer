CREATE TABLE IF NOT EXISTS app_keyspace.subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID,
    plan_name text,
    expiration_date timestamp
)