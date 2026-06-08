CREATE TABLE IF NOT EXISTS app_keyspace.email_verification_codes (
    user_id UUID,
    code TEXT,
    issued_at TIMESTAMP,
    expiration_date TIMESTAMP,
    PRIMARY KEY(user_id, code)
);

CREATE INDEX IF NOT EXISTS ON app_keyspace.email_verification_codes (issued_at);
