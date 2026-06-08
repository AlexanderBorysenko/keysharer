import { client } from './client';
import { runMigrations } from './migrate';

async function refreshDatabase() {
    try {
        // Підключення до Cassandra
        await client.connect();

        const keyspace = 'app_keyspace';
        client.keyspace = keyspace;

        // Збільшуємо тайм-аут з'єднання
        //@ts-ignore
        client.options.socketOptions = { readTimeout: 60000 }; // 60 секунд

        // Функція для очікування узгодження схеми
        async function waitForSchemaAgreement() {
            let inAgreement = false;
            while (!inAgreement) {
                //@ts-ignore
                inAgreement = await client.metadata.checkSchemaAgreement();
                if (!inAgreement) {
                    console.info('Очікуємо узгодження схеми...');
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            }
        }

        // Видалення індексів
        const indexesQuery = `SELECT index_name, table_name FROM system_schema.indexes WHERE keyspace_name = ?`;
        const indexesResult = await client.execute(indexesQuery, [keyspace], { prepare: true });

        for (const row of indexesResult.rows) {
            const indexName = row['index_name'];
            const tableName = row['table_name'];

            console.info(`Видалення індексу ${indexName} на таблиці ${tableName}...`);

            try {
                // Перевіряємо, чи існує таблиця
                const tableExistsResult = await client.execute(
                    `SELECT table_name FROM system_schema.tables WHERE keyspace_name = ? AND table_name = ?`,
                    [keyspace, tableName],
                    { prepare: true }
                );

                if (tableExistsResult.rowLength > 0) {
                    await client.execute(`DROP INDEX IF EXISTS ${keyspace}.${indexName}`);
                    console.info(`Індекс ${indexName} видалено.`);
                } else {
                    console.info(`Таблиця ${tableName} не існує. Індекс ${indexName} пропущено.`);
                }
            } catch (error) {
                console.error(`Помилка видалення індексу ${indexName}:`, error);
                // Продовжуємо виконання, навіть якщо виникла помилка
            }
            await waitForSchemaAgreement();
        }

        // Видалення таблиць, крім `migration_history`
        const tablesQuery = `SELECT table_name FROM system_schema.tables WHERE keyspace_name = ?`;
        const tablesResult = await client.execute(tablesQuery, [keyspace], { prepare: true });

        for (const row of tablesResult.rows) {
            const tableName = row['table_name'];

            if (tableName === 'migration_history') {
                console.info('Пропускаємо видалення таблиці migration_history.');
                continue;
            }

            console.info(`Видалення таблиці ${tableName}...`);
            try {
                await client.execute(`DROP TABLE IF EXISTS ${keyspace}.${tableName}`);
                console.info(`Таблиця ${tableName} видалена.`);
            } catch (error) {
                console.error(`Помилка видалення таблиці ${tableName}:`, error);
                // Продовжуємо виконання, навіть якщо виникла помилка
            }
            await waitForSchemaAgreement();
        }

        // Очищення таблиці `migration_history`
        console.info('Очищення таблиці migration_history...');
        try {
            await client.execute(`TRUNCATE ${keyspace}.migration_history`);
            console.info('Таблиця migration_history очищена.');
        } catch (error) {
            console.error('Помилка очищення таблиці migration_history:', error);
            // Продовжуємо виконання, навіть якщо виникла помилка
        }
        await waitForSchemaAgreement();

        console.info('DROPPED.');

        // Закриваємо підключення
        await client.shutdown();
    } catch (error) {
        console.error('Помилка при оновленні бази даних:', error);
        await client.shutdown();
        process.exit(1);
    }
}

refreshDatabase();
