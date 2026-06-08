import cassandra from 'cassandra-driver';

const client = new cassandra.Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1'
});

async function initializeKeyspace() {
    const query = `
        CREATE KEYSPACE IF NOT EXISTS app_keyspace 
        WITH replication = {
            'class': 'SimpleStrategy',
            'replication_factor': '1'
        }
    `;
    await client.execute(query);
}

initializeKeyspace().then(() => {
    client.keyspace = 'app_keyspace';
    console.info('Keyspace created and client initialized');
}).catch(error => {
    console.error('Error initializing keyspace:', error);
});

export { client };