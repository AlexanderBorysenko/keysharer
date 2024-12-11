declare namespace NodeJS {
    interface ProcessEnv {
        JWT_SECRET: string;
        SERVER_URL: string;
        CLIENT_URL: string;
        IS_DEV: boolean;
        // Додайте інші змінні, якщо потрібно
    }
}