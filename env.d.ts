declare namespace NodeJS {
	interface ProcessEnv {
		JWT_SECRET: string;
		SERVER_URL: string;
		CLIENT_URL: string;
		IS_DEV: boolean;
		COOKIE_DOMAIN: string;

		EMAIL_USER: string;
		EMAIL_PASSWORD: string;
	}
}
