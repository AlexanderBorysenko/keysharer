import cassandra from 'cassandra-driver';

export const client = new cassandra.Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'app_keyspace'
    // Спочатку без ключового простору
});