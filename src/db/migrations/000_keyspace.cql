CREATE KEYSPACE IF NOT EXISTS app_keyspace
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'}