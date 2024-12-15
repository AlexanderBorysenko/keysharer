CREATE TABLE IF NOT EXISTS app_keyspace.users (
  id UUID PRIMARY KEY,
  username text,
  display_name text,
  avatar text,
  email text,
  email_verified boolean,
  active_sessions_count COUNTER
  password text
);
CREATE INDEX IF NOT EXISTS ON app_keyspace.users (username) USING 'org.apache.cassandra.index.sasi.SASIIndex'
WITH OPTIONS = {
  'mode': 'CONTAINS',
  'analyzer_class': 'org.apache.cassandra.index.sasi.analyzer.NonTokenizingAnalyzer',
  'case_sensitive': 'false'
};
CREATE INDEX IF NOT EXISTS ON app_keyspace.users (email);