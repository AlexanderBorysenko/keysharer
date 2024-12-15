import type { ArrayOrObject } from "cassandra-driver";

export type Queries = Array<string | {
    query: string;
    params?: ArrayOrObject;
}>;