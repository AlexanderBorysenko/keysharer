import type { ValueTypes } from "./zeus";

export type GQType<Key extends keyof ValueTypes> = ValueTypes[Key]