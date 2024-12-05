```
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

CREATE TABLE chats (
    id UUID PRIMARY KEY,
    name text,
    avatar text,
    owner_id UUID,
);

CREATE TABLE chat_users (
    id UUID PRIMARY KEY,
    chat_id UUID,
    user_id UUID,
    PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE messages (
    id TIMEUUID,
    chat_id UUID,
    user_id UUID,
    type TEXT,
    content TEXT,
    status TEXT,
    timestamp TIMESTAMP,
    PRIMARY KEY (chat_id, id)
) WITH CLUSTERING ORDER BY (id ASC);
```

```
import client from '/src/db/client.ts';
```
