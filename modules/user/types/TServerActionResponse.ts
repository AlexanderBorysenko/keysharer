export type TServerActionResponse<T = null> = {
    details: {
        [key: string]: string;
    };
    data?: T | null;
    error?: string;
    message: string;
    timestamp: string;
}
