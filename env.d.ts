declare namespace NodeJS {
    interface ProcessEnv {
        JWT_SECRET: string;
        SERVER_URL: string;
        // Додайте інші змінні, якщо потрібно
    }
}