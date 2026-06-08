export type AllRequired<T> = {
    [K in keyof T]-?: NonNullable<T[K]>;
}