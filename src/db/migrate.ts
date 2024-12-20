import fs from 'fs';
import path from 'path';
import { client } from './client';

export const runMigrations = async () => {
    // Переконайтеся, що клієнт підключений
    await client.connect();

    const migrationsDir = path.join(__dirname, './migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.cql'))
        .sort();

    // Перевірка та створення таблиці для відстеження міграцій
    await client.execute(`
        CREATE TABLE IF NOT EXISTS app_keyspace.migration_history (
            id UUID PRIMARY KEY,
            filename text,
            applied_at timestamp
        );
    `);

    // Отримуємо список виконаних міграцій
    const result = await client.execute('SELECT filename FROM app_keyspace.migration_history');
    const appliedMigrations = new Set(result.rows.map(row => row.filename));

    for (const file of migrationFiles) {
        if (appliedMigrations.has(file)) {
            console.info(`Міграція ${file} вже виконана, пропускаємо...`);
            continue;
        }

        console.info(`Виконується міграція: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');

        // Розділяємо запити за крапкою з комою
        const queries = fileContent
            .split(';')
            .map(query => query.trim())
            .filter(query => query.length > 0);

        try {
            for (const query of queries) {
                await client.execute(query);
            }

            await client.execute(
                'INSERT INTO app_keyspace.migration_history (id, filename, applied_at) VALUES (uuid(), ?, toTimestamp(now()))',
                [file],
                { prepare: true }
            );
            console.info(`Міграція ${file} виконана успішно`);
        } catch (error) {
            console.error(`Помилка виконання міграції ${file}:`, error);
            process.exit(1);
        }
    }

    await client.shutdown();
}

runMigrations().catch(error => {
    console.error('Помилка міграції:', error);
    process.exit(1);
});
