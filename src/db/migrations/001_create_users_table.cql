CREATE TABLE IF NOT EXISTS app_keyspace.users (
  id UUID PRIMARY KEY,
  username text,
  display_name text,
  avatar text,
  email text,
  email_verified boolean,
  password text
);
CREATE INDEX IF NOT EXISTS ON app_keyspace.users (username);
CREATE INDEX IF NOT EXISTS ON app_keyspace.users (email);